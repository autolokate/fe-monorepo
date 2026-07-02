import { ArrowRight, Star } from "lucide-react";
import { AlButton } from "@autolokate/ui/button";
import { cn } from "@/lib/utils";
import type { SafetyPlan } from "./types";
import styles from "./index.module.css";

interface PlanCardProps {
  plan: SafetyPlan;
  focused?: boolean;
  onChoose?: () => void;
}

export function PlanCard({ plan, focused = false, onChoose }: PlanCardProps) {
  const { tierLabel, Icon, price, pricePeriod, popular, popularBadge, features, ctaLabel } = plan;

  return (
    <article
      className={cn(
        styles.card,
        popular && styles.cardPopular,
        focused && styles.cardFocused,
        "flex h-full flex-col rounded-3xl px-6 pb-6 pt-7 sm:px-7",
      )}
    >
      {popular ? (
        <span className={styles.popularPill}>
          <Star className="h-3 w-3 fill-current" aria-hidden />
          {popularBadge}
        </span>
      ) : null}

      <div className="flex flex-col items-center text-center">
        <span className={styles.tierBadge} aria-hidden>
          <Icon className="h-6 w-6 stroke-[1.75]" />
        </span>
        <p className={cn(styles.tierName, "mt-4")}>{tierLabel}</p>

        <p className="mt-3">
          <span className="font-display text-4xl font-bold tracking-tight text-foreground">
            {price}
          </span>
          <span className="ml-1 text-sm font-medium text-muted-foreground">{pricePeriod}</span>
        </p>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3.5 border-t border-border/60 pt-6">
        {features.map(({ label, Icon: FeatureIcon }) => (
          <li key={label} className="flex items-center gap-3">
            <span className={styles.featureIcon} aria-hidden>
              <FeatureIcon className="h-4 w-4 stroke-[1.75]" />
            </span>
            <span className="text-sm font-medium leading-snug text-foreground">{label}</span>
          </li>
        ))}
      </ul>

      <AlButton
        size="lg"
        variant={popular ? "primary" : "outline"}
        className="mt-7 w-full justify-center"
        icon={<ArrowRight className="h-4 w-4" aria-hidden />}
        iconPosition="end"
        onClick={onChoose}
        tabIndex={focused ? 0 : -1}
      >
        {ctaLabel}
      </AlButton>
    </article>
  );
}
