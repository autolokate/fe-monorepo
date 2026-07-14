import { ArrowLeft, BadgeCheck, Lock } from "lucide-react";
import { AlButton } from "@autolokate/ui/button";
import { cn } from "@/lib/utils";
import type { StepProps } from "../../types";
import styles from "./index.module.css";

export function PlateStep({ state, plan, update, goTo }: StepProps) {
  const plateShown = state.plate.trim() || "HR 26 DK 8337";
  const mobileShown = state.mobile.trim() || "98765 43210";
  const canLookup = state.plate.trim().length >= 6;

  const setPlate = (value: string) =>
    update({ plate: value.toUpperCase().slice(0, 13), rcVerified: false });

  return (
    <div className={styles.wrap}>
      <button type="button" onClick={() => goTo("scan")} className={styles.back}>
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      <div className={styles.card}>
        <h1 className={cn(styles.title, "font-display")}>Which vehicle is this for?</h1>
        <p className={styles.sub}>We verify the registration with VAHAN.</p>

        <label htmlFor="plate" className={styles.label}>
          Registration number
        </label>
        <input
          id="plate"
          className={styles.plate}
          value={state.plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder="HR 26 DK 8337"
          autoComplete="off"
        />

        {!state.rcVerified ? (
          <AlButton
            size="lg"
            radius="lg"
            variant="primary"
            className={styles.action}
            disabled={!canLookup}
            onClick={() => update({ rcVerified: true })}
          >
            Look up RC on VAHAN
          </AlButton>
        ) : (
          <>
            <div className={styles.rcCard}>
              <p className={styles.rcBadge}>
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                VAHAN RC verified
              </p>
              <p className={styles.rcName}>Maruti Suzuki Baleno Zeta</p>
              <p className={styles.rcMeta}>
                {plateShown} · Petrol · Reg. 2022 · Owner D***k C.
              </p>
            </div>

            <p className={styles.gated}>
              <Lock className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                Activation gated to buyer&apos;s number <b>+91 {mobileShown}</b> — verified on this
                device.
              </span>
            </p>

            <AlButton
              size="lg"
              radius="lg"
              variant="primary"
              className={styles.action}
              onClick={() => goTo("contacts")}
            >
              Activate {plan.name} — no payment
            </AlButton>
          </>
        )}
      </div>
    </div>
  );
}
