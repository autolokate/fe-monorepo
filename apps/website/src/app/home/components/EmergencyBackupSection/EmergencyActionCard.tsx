import type { EmergencyAction } from "./types";

interface EmergencyActionCardProps {
  action: EmergencyAction;
}

export function EmergencyActionCard({ action }: EmergencyActionCardProps) {
  const { title, body, Icon, step } = action;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:p-[1.125rem]">
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white"
          aria-hidden
        >
          <Icon className="h-[1.125rem] w-[1.125rem] fill-current stroke-[1.75]" />
        </span>
        <span
          className="mt-0.5 inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-full bg-white/10 px-2 text-[11px] font-bold tabular-nums text-white"
          aria-hidden
        >
          {step}
        </span>
      </div>

      <h3 className="mt-4 text-sm font-bold leading-snug text-white sm:text-[0.9375rem]">{title}</h3>
      <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-white/60 sm:text-[13px]">{body}</p>

      <span className="mt-4 block h-0.5 w-10 rounded-full bg-white/30" aria-hidden />
    </article>
  );
}
