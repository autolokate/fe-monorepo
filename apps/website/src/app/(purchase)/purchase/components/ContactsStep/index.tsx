import { Check } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { AlTextField } from '@autolokate/ui';
import { cn } from '@/lib/utils';
import type { StepProps } from '../../types';
import styles from './index.module.css';

export function ContactsStep({ state, update, goTo }: StepProps) {
  const canFinish = state.contact1.trim().length > 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.head}>
          <span className={styles.badge} aria-hidden>
            <Check className="h-6 w-6 stroke-[3]" />
          </span>
          <span className={styles.activated}>Activated · Valid 1 year</span>
        </div>

        <h1 className={cn(styles.title, 'font-display')}>Now add your people.</h1>
        <p className={styles.sub}>They&apos;re alerted automatically if a crash is detected.</p>

        <div className={styles.fields}>
          <AlTextField
            id="contact-1"
            label="Emergency contact 1"
            prefix=""
            placeholder="Name · +91 mobile"
            value={state.contact1}
            onChange={(e) => update({ contact1: e.target.value })}
          />
          <AlTextField
            id="contact-2"
            label="Emergency contact 2 (optional)"
            prefix=""
            placeholder="Name · +91 mobile"
            value={state.contact2}
            onChange={(e) => update({ contact2: e.target.value })}
          />
        </div>

        <button
          type="button"
          className={cn(styles.riders, state.addRiders && styles.ridersOn)}
          onClick={() => update({ addRiders: !state.addRiders })}
          aria-pressed={state.addRiders}
        >
          <span className={cn(styles.check, state.addRiders && styles.checkOn)} aria-hidden>
            {state.addRiders ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : null}
          </span>
          <span className={styles.ridersText}>
            <b>Others drive this car too</b>
            <span>Add riders later so alerts name the right person.</span>
          </span>
        </button>

        <AlButton
          size="lg"
          radius="lg"
          variant="primary"
          className={styles.action}
          disabled={!canFinish}
          onClick={() => goTo('active')}
        >
          Finish setup
        </AlButton>
      </div>
    </div>
  );
}
