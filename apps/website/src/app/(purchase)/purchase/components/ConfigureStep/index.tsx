import { ArrowRight, Minus, PartyPopper, Plus } from "lucide-react";
import { AlButton } from "@autolokate/ui/button";
import { useSafetyPlans } from "@/hooks/plans";
import { MAX_QTY, PLAN_ID_TO_TIER, formatInr } from "../../constants";
import type { StepProps } from "../../types";
import { StepShell } from "../StepShell";
import styles from "./index.module.css";

export function ConfigureStep({
  state,
  plan,
  update,
  goTo,
  exitToOrigin,
  canBrowsePlans,
}: StepProps) {
  const { data: plans } = useSafetyPlans();
  const apiPlan = (plans ?? []).find((p) => p.tier === PLAN_ID_TO_TIER[state.planId]);
  const riderOptions = apiPlan?.riderOptions ?? [];

  // Everything money/quantity related comes straight from the plans API — the
  // name, the rider-option prices, discount %, and the max quantity. The static
  // plan name is only a placeholder label until the API responds.
  const planName = apiPlan?.name ?? plan.name;
  const maxQty = riderOptions.length > 0 ? riderOptions.length : MAX_QTY;
  const activeOption = riderOptions.find((option) => option.riderCount === state.qty);
  const currentDiscount = activeOption?.discountPercent ?? 0;
  const toRupees = (paise: number) => formatInr(Math.round(paise / 100));

  const decQty = () => update({ qty: Math.max(0, state.qty - 1) });
  const incQty = () => update({ qty: Math.min(maxQty, state.qty + 1) });

  return (
    <StepShell
      title={`${planName} plan`}
      subtitle="How many riders do you want to cover?"
      backLabel={canBrowsePlans ? "All plans" : "Back"}
      onBack={canBrowsePlans ? () => goTo("plans") : exitToOrigin}
    >
      <div className={styles.card}>
        <div className={styles.qtyRow}>
          <div>
            <p className={styles.qtyTitle}>Riders</p>
            <p className={styles.qtyHint}>₹1L cover for each rider</p>
          </div>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={decQty}
              disabled={state.qty <= 0}
              aria-label="Remove a rider"
            >
              <Minus className="h-4 w-4" aria-hidden />
            </button>
            <span className={styles.qtyValue}>{state.qty}</span>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={incQty}
              disabled={state.qty >= maxQty}
              aria-label="Add a rider"
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {currentDiscount > 0 ? (
          <p className={styles.discount}>
            <PartyPopper className="h-4 w-4" aria-hidden />
            {currentDiscount}% discount applied on {state.qty}{" "}
            {state.qty === 1 ? "rider" : "riders"}
          </p>
        ) : state.qty < maxQty ? (
          <p className={styles.upsell}>
            Ride with a partner or family? Add more riders to unlock a{" "}
            <strong>multi-rider discount</strong>.
          </p>
        ) : null}
      </div>

      {state.qty > 0 ? (
        <div className={styles.subtotalCard}>
          <span className={styles.subtotalLabel}>
            {state.qty} × {planName}
          </span>
          {activeOption ? (
            <span className={styles.subtotalValue}>
              {activeOption.discountPercent > 0 ? (
                <span className={styles.subtotalOriginal}>
                  ₹{toRupees(activeOption.originalPricePaise)}
                </span>
              ) : null}
              ₹{toRupees(activeOption.pricePaise)}
            </span>
          ) : (
            <span className={styles.subtotalValue}>—</span>
          )}
        </div>
      ) : null}

      <AlButton
        size="lg"
        radius="lg"
        variant="primary"
        className={styles.continue}
        icon={<ArrowRight className="h-4 w-4" aria-hidden />}
        iconPosition="end"
        onClick={() => goTo("login")}
      >
        {state.qty < 1 ? "Skip, I'll ride solo" : "Continue"}
      </AlButton>
    </StepShell>
  );
}
