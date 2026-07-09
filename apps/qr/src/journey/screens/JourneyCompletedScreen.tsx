import { AlIcon } from '@autolokate/icons';
import { AlButton, AlChip, AlHeading, AlScreenBg, AlText, formatPlateInput } from '@autolokate/ui';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getActivationCompleteChipLabel,
  getActivationCompleteSubtitle,
  getActivationCompleteTitle,
} from '../../features/qr-purchase/data/purchase-pricing';
import { resolvePurchasePlanId } from '../../features/emergency/emergency-limits';
import { useJourney } from '../JourneyContext';
import { journeyPaths } from '../constants';

import './completion-experience/completion-experience.css';

export function JourneyCompletedScreen() {
  const navigate = useNavigate();
  const { session, clearJourney, setPhase } = useJourney();

  const planId = resolvePurchasePlanId(session.purchase?.selectedPlanId);
  const plateDisplay = useMemo(() => {
    const raw = session.vehicle?.plate;
    return raw ? formatPlateInput(raw) : undefined;
  }, [session.vehicle?.plate]);

  const headline = getActivationCompleteTitle(planId);
  const subtitle = getActivationCompleteSubtitle(planId, plateDisplay);
  const chipLabel = getActivationCompleteChipLabel(planId);

  useEffect(() => {
    setPhase('completed');
  }, [setPhase]);

  const finish = () => {
    clearJourney();
    void navigate(journeyPaths.entry);
  };

  return (
    <AlScreenBg variant="protected" className="ob-completion">
      <div className="ob-completion__frame">
        <div className="ob-completion__content">
          <div className="ob-completion__hero" aria-hidden>
            <AlIcon name="activation-complete-halo" size={240} />
          </div>

          <AlHeading variant="h1" className="ob-completion__title">
            {headline}
          </AlHeading>
          <AlText tone="muted" className="ob-completion__subtitle">
            {subtitle}
          </AlText>

          <AlChip variant="green" label={chipLabel} className="ob-completion__status-chip" />
        </div>

        <footer className="ob-completion__footer">
          <AlButton variant="primary" className="ob-completion__cta" onClick={finish}>
            Go to home
          </AlButton>
        </footer>
      </div>
    </AlScreenBg>
  );
}
