import type { CSSProperties } from 'react';
import { MapPin, ShieldCheck, UserRound } from 'lucide-react';
import type { ProtectionCard as ProtectionCardType } from './types';
import styles from './index.module.css';

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const COUNTDOWN_PROGRESS = 0.75;

interface ProtectionCardProps {
  card: ProtectionCardType;
}

function CardHeading({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div>
      <span className={`${styles.amber} font-mono text-xs font-bold tracking-wider`}>{step}</span>
      <h4 className="mt-1 text-lg font-bold leading-snug">{title}</h4>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

export function ProtectionCard({ card }: ProtectionCardProps) {
  const isImage = card.kind === 'image';

  const imageVars =
    card.kind === 'image'
      ? ({
          '--bg-dark': `url(${card.image.dark})`,
          '--bg-light': `url(${card.image.light})`,
          ...(card.imagePosition ? { '--bg-pos': card.imagePosition } : {}),
        } as CSSProperties)
      : undefined;

  return (
    <article
      style={imageVars}
      className={`${styles.protCard} relative flex h-[21rem] flex-col overflow-hidden rounded-2xl p-5 text-foreground ${
        isImage ? styles.imageCard : styles.contentCard
      }`}
    >
      {isImage ? <div className={styles.imageScrim} aria-hidden /> : null}

      <div className="relative z-10 flex h-full flex-col">
        <CardHeading step={card.step} title={card.title} body={card.body} />

        {card.kind === 'countdown' ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <span className={styles.countdownPulse} aria-hidden />
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
                <circle
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="6"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="var(--al-signal-green)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={RING_CIRCUMFERENCE * (1 - COUNTDOWN_PROGRESS)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-5 text-center leading-none">
                <span className="text-[10px] text-muted-foreground">{card.ringLabel}</span>
                <span className="font-display text-[2.5rem] font-bold tabular-nums">
                  {card.seconds}
                </span>
                <span className="text-[10px] text-muted-foreground">{card.ringUnit}</span>
              </div>
            </div>
          </div>
        ) : null}

        {card.kind === 'notify' ? (
          <div className="mt-auto">
            <div className={`${styles.alertPanel} rounded-xl p-3`}>
              <div className="flex items-start gap-2.5">
                <span
                  className={`${styles.alertBadge} flex h-7 w-7 shrink-0 items-center justify-center rounded-lg`}
                  aria-hidden
                >
                  <ShieldCheck className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight">{card.alert.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {card.alert.detail}
                  </p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2.5">
                <span
                  className={`${styles.amber} flex h-7 w-7 shrink-0 items-center justify-center`}
                >
                  <MapPin className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                </span>
                <p className="text-[11px] leading-snug text-muted-foreground">
                  {card.alert.mapLine}
                </p>
              </div>
            </div>

            <div className="mt-3 flex -space-x-2">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-gradient-to-br from-zinc-400 to-zinc-600"
                  aria-hidden
                >
                  <UserRound className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
