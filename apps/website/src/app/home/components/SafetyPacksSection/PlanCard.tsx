import { Check, Minus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanFeature, SafetyPlan } from "./types";

function FeatureRow({ label, description, state }: PlanFeature) {
  const included = state === "included";

  return (
    <li className="flex gap-2.5">
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          included
            ? "bg-foreground text-background"
            : "border border-border/80 bg-muted/40 text-muted-foreground",
        )}
        aria-hidden
      >
        {included ? (
          <Check className="h-3 w-3 stroke-[2.5]" />
        ) : (
          <Minus className="h-3 w-3 stroke-[2.5]" />
        )}
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-[13px] font-semibold leading-snug",
            included ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
          {!included ? (
            <span className="ml-1.5 font-medium text-muted-foreground/80">Not included</span>
          ) : null}
        </p>
        {description ? (
          <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </li>
  );
}

interface PlanCardProps {
  plan: SafetyPlan;
}

export function PlanCard({ plan }: PlanCardProps) {
  const isPopular = plan.variant === "shield";
  const priceDisplay = plan.price || (plan.title === "Coming Soon" ? plan.title : plan.price);
  const showTitle = plan.title !== "Coming Soon";

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)]",
        isPopular
          ? "border-amber-400/40 shadow-[0_0_0_1px_rgba(245,158,11,0.18),0_12px_40px_-12px_rgba(245,158,11,0.28)]"
          : "border-black/10",
      )}
    >
      {isPopular ? (
        <div className="flex items-center justify-center gap-2 bg-black px-4 py-2.5">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">
            {plan.tierLabel} — {plan.popularBadge}
          </span>
        </div>
      ) : null}

      <div className={cn("px-5 pt-5 sm:px-6", isPopular && "pt-5")}>
        {!isPopular ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {plan.tierLabel}
          </p>
        ) : plan.planCategory ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {plan.planCategory}
          </p>
        ) : null}

        {showTitle ? (
          <h3 className="font-display mt-2 text-xl font-bold tracking-tight text-foreground">
            {plan.title}
          </h3>
        ) : null}

        {priceDisplay ? (
          <p
            className={cn(
              "font-display font-bold tracking-tight text-foreground",
              showTitle ? "mt-3 text-4xl" : "mt-2 text-4xl",
            )}
          >
            {priceDisplay}
          </p>
        ) : null}

        <p className="mt-1.5 text-xs text-muted-foreground">{plan.priceNote}</p>
      </div>

      <ul className="mt-4 flex flex-1 flex-col gap-3 border-t border-border/60 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        {plan.features.map((feature) => (
          <FeatureRow key={feature.label} {...feature} />
        ))}
      </ul>
    </article>
  );
}
