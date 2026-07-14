import { ArrowRight, BadgeCheck, Check, Star } from "lucide-react";
import { AlButton } from "@autolokate/ui/button";
import { cn } from "@/lib/utils";
import { PURCHASE_PLANS, formatInr } from "../../constants";
import type { StepProps } from "../../types";
import styles from "./index.module.css";

const TRUST_POINTS = ["VAHAN verified", "42,000+ owners · 4.8★", "Cancel anytime"];

export function PlansStep({ update }: StepProps) {
  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={cn(styles.title, "font-display")}>Choose your protection</h1>
        <p className={styles.subtitle}>
          One payment covers a full year. Smart QR sticker ships free in 3–5 days.
        </p>
      </header>

      <div className={styles.grid}>
        {PURCHASE_PLANS.map((plan) => {
          const { Icon } = plan;
          const monthly = Math.round(plan.price / 12);
          return (
            <article
              key={plan.id}
              className={cn(styles.card, plan.popular && styles.cardPopular)}
            >
              {plan.popular ? (
                <span className={styles.popularPill}>
                  <Star className="h-3 w-3 fill-current" aria-hidden />
                  {plan.popularBadge}
                </span>
              ) : null}

              <span className={styles.tierBadge} aria-hidden>
                <Icon className="h-5 w-5 stroke-[1.75]" />
              </span>
              <p className={styles.tierName}>{plan.name}</p>
              <p className={styles.tierTag}>{plan.tag}</p>

              <p className={styles.price}>
                ₹{formatInr(plan.price)}
                <span className={styles.pricePeriod}> /year</span>
              </p>
              <p className={styles.monthly}>that&apos;s ₹{formatInr(monthly)}/month</p>

              <ul className={styles.features}>
                {plan.features.map((feature) => (
                  <li key={feature} className={styles.feature}>
                    <Check className="h-4 w-4 shrink-0 stroke-[2.5]" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              <AlButton
                size="lg"
                radius="lg"
                variant={plan.popular ? "primary" : "outline"}
                className={styles.cta}
                icon={<ArrowRight className="h-4 w-4" aria-hidden />}
                iconPosition="end"
                onClick={() => update({ planId: plan.id, step: "configure" })}
              >
                Choose {plan.name}
              </AlButton>
            </article>
          );
        })}
      </div>

      <ul className={styles.trust}>
        {TRUST_POINTS.map((point) => (
          <li key={point} className={styles.trustItem}>
            <BadgeCheck className="h-4 w-4" aria-hidden />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
