import { ArrowRight, Check } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { cn } from '@/lib/utils';
import type { StepProps } from '../../types';
import styles from './index.module.css';

const BULLETS = [
  '1-year cover · already paid',
  "Activates only with the buyer's number",
  'Takes about 2 minutes',
];

export function ScanStep({ plan, goTo }: StepProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.top}>
          <div className={styles.qr} aria-hidden>
            <span className={styles.qrGlyph}>A</span>
          </div>
          <span className={styles.verified}>QR scanned · Verified</span>
        </div>

        <h1 className={cn(styles.title, 'font-display')}>
          Covered with {plan.name}.
          <br />
          Set it up.
        </h1>
        <p className={styles.sub}>
          This QR carries a prepaid <b>{plan.name}</b> plan. No payment needed — just link it to
          your vehicle.
        </p>

        <ul className={styles.bullets}>
          {BULLETS.map((bullet) => (
            <li key={bullet}>
              <Check className="h-4 w-4 shrink-0 stroke-[2.5]" aria-hidden />
              {bullet}
            </li>
          ))}
        </ul>

        <AlButton
          size="lg"
          radius="lg"
          variant="primary"
          className={styles.action}
          icon={<ArrowRight className="h-4 w-4" aria-hidden />}
          iconPosition="end"
          onClick={() => goTo('plate')}
        >
          Set it up
        </AlButton>
      </div>
    </div>
  );
}
