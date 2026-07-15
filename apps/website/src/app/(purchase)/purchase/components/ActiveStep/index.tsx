import { RotateCcw, ShieldCheck } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { cn } from '@/lib/utils';
import type { StepProps } from '../../types';
import styles from './index.module.css';

export function ActiveStep({ state, plan, update }: StepProps) {
  const plateShown = state.plate.trim() || 'HR 26 DK 8337';
  const renewLine = state.autoRenew
    ? "↻ Auto-renews 13 Jul 2027 at today's price"
    : '⚠ No auto-renew — plan lapses 13 Jul 2027 unless re-subscribed';

  const checklist = [
    'Crash detection & family alerts — ON',
    'Emergency contacts saved',
    'QR live: Park Me, Emergency Help, records',
    renewLine,
  ];

  const restart = () => {
    update({ step: 'plans', otpSent: false, otp: '', rcVerified: false });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.ring} aria-hidden>
          <div className={styles.ringInner}>
            <ShieldCheck className="h-8 w-8" />
          </div>
        </div>

        <h1 className={cn(styles.title, 'font-display')}>You&apos;re protected.</h1>
        <p className={styles.sub}>
          {plan.name} is active on <b>{plateShown}</b> until <b>13 Jul 2027</b>. Crash detection is
          watching every drive.
        </p>

        <ul className={styles.checklist}>
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <AlButton size="lg" radius="lg" variant="primary" className={styles.dashboard}>
          Open your dashboard
        </AlButton>

        <button type="button" className={styles.restart} onClick={restart}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Restart demo
        </button>
      </div>
    </div>
  );
}
