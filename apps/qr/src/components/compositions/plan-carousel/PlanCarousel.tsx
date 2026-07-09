import { useCallback, useEffect, useRef } from 'react';
import { AlIcon } from '@autolokate/icons';
import { AlPlanCard } from '@autolokate/ui';

import type { PurchasePlanDefinition, PurchasePlanId } from '@/features/qr-purchase/types-checkout.js';
import { PURCHASE_PLANS } from '@/features/qr-purchase/data/purchase-plans.js';

import './plan-carousel.css';

export type PlanCarouselProps = {
  selectedPlanId: PurchasePlanId;
  onSelectPlan: (planId: PurchasePlanId) => void;
};

/** Figma layout_8MYIF9 — 270px card + 14px gap */
const CARD_STEP_PX = 284;
const SCROLL_SETTLE_MS = 70;
const CENTER_THRESHOLD_PX = 14;
/** Prevent flicker when two cards are nearly equidistant from center */
const CENTER_HYSTERESIS_PX = 24;

function getSelectedIndex(planId: PurchasePlanId): number {
  const index = PURCHASE_PLANS.findIndex((plan) => plan.id === planId);
  return index >= 0 ? index : 1;
}

function centerSlide(track: HTMLDivElement, slide: HTMLElement, behavior: ScrollBehavior) {
  const scrollLeft = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
  track.scrollTo({ left: Math.max(0, scrollLeft), behavior });
}

function isSlideNearCenter(track: HTMLDivElement, slide: HTMLElement): boolean {
  const trackRect = track.getBoundingClientRect();
  const viewportCenter = trackRect.left + trackRect.width / 2;
  const slideRect = slide.getBoundingClientRect();
  const slideCenter = slideRect.left + slideRect.width / 2;
  return Math.abs(slideCenter - viewportCenter) <= CENTER_THRESHOLD_PX;
}

function getCenteredPlanIndex(track: HTMLDivElement): number | null {
  const trackRect = track.getBoundingClientRect();
  const viewportCenter = trackRect.left + trackRect.width / 2;

  const ranked = Array.from(track.children).flatMap((child, index) => {
    if (!(child instanceof HTMLElement)) {
      return [];
    }
    const rect = child.getBoundingClientRect();
    const slideCenter = rect.left + rect.width / 2;
    return [{ index, distance: Math.abs(slideCenter - viewportCenter) }];
  });

  ranked.sort((a, b) => a.distance - b.distance);
  const closest = ranked[0];
  const runnerUp = ranked[1];

  if (!closest || closest.distance > CARD_STEP_PX / 2) {
    return null;
  }

  if (runnerUp && runnerUp.distance - closest.distance < CENTER_HYSTERESIS_PX) {
    return null;
  }

  return closest.index;
}

/** Figma R06 — 366px viewport, selected card 270×366, scroll-to-center selection. */
export function PlanCarousel({ selectedPlanId, onSelectPlan }: PlanCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const skipCenterOnSelectionRef = useRef(false);
  const selectedPlanIdRef = useRef(selectedPlanId);
  const featureIcon = <AlIcon name="circle-check" size={15} aria-hidden />;
  const selectedIcon = <AlIcon name="circle-check" size={24} aria-hidden />;

  selectedPlanIdRef.current = selectedPlanId;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const slide = track.children.item(getSelectedIndex(selectedPlanIdRef.current));
    if (slide instanceof HTMLElement) {
      centerSlide(track, slide, 'auto');
    }
  }, []);

  useEffect(() => {
    if (skipCenterOnSelectionRef.current) {
      skipCenterOnSelectionRef.current = false;
      return;
    }

    const track = trackRef.current;
    if (!track) {
      return;
    }

    const slide = track.children.item(getSelectedIndex(selectedPlanId));
    if (!(slide instanceof HTMLElement) || isSlideNearCenter(track, slide)) {
      return;
    }

    isProgrammaticScrollRef.current = true;
    centerSlide(track, slide, 'smooth');
  }, [selectedPlanId]);

  const syncSelectionToCenter = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    if (isProgrammaticScrollRef.current) {
      isProgrammaticScrollRef.current = false;
      return;
    }

    const centeredIndex = getCenteredPlanIndex(track);
    if (centeredIndex === null) {
      return;
    }

    const centeredPlan = PURCHASE_PLANS[centeredIndex];
    if (!centeredPlan || centeredPlan.id === selectedPlanIdRef.current) {
      return;
    }

    skipCenterOnSelectionRef.current = true;
    onSelectPlan(centeredPlan.id);
  }, [onSelectPlan]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const scheduleSettle = () => {
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }
      scrollTimerRef.current = window.setTimeout(() => {
        scrollTimerRef.current = null;
        syncSelectionToCenter();
      }, SCROLL_SETTLE_MS);
    };

    const onScrollEnd = () => {
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = null;
      }
      syncSelectionToCenter();
    };

    track.addEventListener('scroll', scheduleSettle, { passive: true });
    track.addEventListener('scrollend', onScrollEnd);

    return () => {
      track.removeEventListener('scroll', scheduleSettle);
      track.removeEventListener('scrollend', onScrollEnd);
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, [syncSelectionToCenter]);

  const handleSelectPlan = useCallback(
    (planId: PurchasePlanId) => {
      skipCenterOnSelectionRef.current = true;
      onSelectPlan(planId);

      const track = trackRef.current;
      if (!track) {
        return;
      }

      const slide = track.children.item(getSelectedIndex(planId));
      if (!(slide instanceof HTMLElement)) {
        return;
      }

      if (isSlideNearCenter(track, slide)) {
        return;
      }

      isProgrammaticScrollRef.current = true;
      centerSlide(track, slide, 'smooth');
    },
    [onSelectPlan],
  );

  return (
    <section className="ob-plan-carousel" aria-label="Plan comparison carousel">
      <div className="ob-plan-carousel__viewport">
        <div ref={trackRef} className="ob-plan-carousel__track">
          {PURCHASE_PLANS.map((plan: PurchasePlanDefinition) => {
            const isSelected = plan.id === selectedPlanId;
            return (
              <div
                key={plan.id}
                className={`ob-plan-carousel__slide${isSelected ? ' ob-plan-carousel__slide--selected' : ''}`}
              >
                <AlPlanCard
                  className="ob-plan-carousel__card"
                  name={plan.name}
                  price={plan.priceLabel}
                  badge={plan.badge ?? undefined}
                  includesLabel={plan.includesLabel ?? undefined}
                  features={[...plan.features]}
                  addon={plan.addon}
                  selected={isSelected}
                  featureIcon={featureIcon}
                  selectedIcon={selectedIcon}
                  onSelect={() => {
                    handleSelectPlan(plan.id);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
