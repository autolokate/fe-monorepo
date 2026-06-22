import { Plus } from "lucide-react";
import {
  EMERGENCY_BACKUP_ACTIONS,
  EMERGENCY_BACKUP_BADGE_ICON,
  EMERGENCY_BACKUP_COPY,
  EMERGENCY_BACKUP_LAYERS,
} from "./constants";
import { EmergencyActionCard } from "./EmergencyActionCard";
import { LayerComparisonCard } from "./LayerComparisonCard";

export function EmergencyBackupSection() {
  const BadgeIcon = EMERGENCY_BACKUP_BADGE_ICON;

  return (
    <section
      aria-labelledby="emergency-backup-heading"
      className="relative isolate z-[1] bg-background py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          <div className="min-w-0 lg:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <BadgeIcon className="h-3 w-3 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden />
              {EMERGENCY_BACKUP_COPY.eyebrow}
            </span>

            <h2
              id="emergency-backup-heading"
              className="font-display mt-5 text-balance text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]"
            >
              {EMERGENCY_BACKUP_COPY.headlineLine1}
              <br />
              {EMERGENCY_BACKUP_COPY.headlineLine2}
            </h2>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
              {EMERGENCY_BACKUP_COPY.description}
            </p>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <div className="rounded-2xl border border-black/10 bg-black text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)] sm:rounded-3xl">
              <div className="border-b border-white/10 px-5 py-4 sm:px-6 sm:py-5 lg:px-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">
                  {EMERGENCY_BACKUP_COPY.actionsEyebrow}
                </p>
              </div>
              <ul className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:gap-3 sm:p-5 lg:p-6">
                {EMERGENCY_BACKUP_ACTIONS.map((action) => (
                  <li key={action.id} className="min-w-0">
                    <EmergencyActionCard action={action} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-4 sm:mt-12 md:grid-cols-[1fr_auto_1fr] md:gap-5 lg:mt-14">
          <LayerComparisonCard layer={EMERGENCY_BACKUP_LAYERS[0]} />
          <div className="flex items-center justify-center py-1 md:py-0" aria-hidden>
            <Plus className="h-5 w-5 text-muted-foreground/50" strokeWidth={1.75} />
          </div>
          <LayerComparisonCard layer={EMERGENCY_BACKUP_LAYERS[1]} />
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground sm:mt-8 sm:text-[13px]">
          {EMERGENCY_BACKUP_COPY.disclaimer}
        </p>
      </div>
    </section>
  );
}
