import { AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import {
  BELIEFS_CARD_TITLE,
  IMPORTANT_CARD_TITLE,
  beliefs,
  importantInfo,
} from "./constants";

const sectionTitle =
  "font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl";

export function Philosophy() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
        <div className="rounded-3xl border border-border/80 bg-card p-7 shadow-app-soft sm:p-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lock className="h-4 w-4" aria-hidden />
            </span>
            <h2 className={sectionTitle}>{BELIEFS_CARD_TITLE}</h2>
          </div>
          <ul className="mt-6 space-y-5">
            {beliefs.map((item) => (
              <li key={item.title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/[0.07] p-7 shadow-[0_1px_3px_rgba(251,191,36,0.06)] sm:p-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-600">
              <AlertTriangle className="h-4 w-4" aria-hidden />
            </span>
            <h2 className={sectionTitle}>{IMPORTANT_CARD_TITLE}</h2>
          </div>
          <ul className="mt-6 space-y-5">
            {importantInfo.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/75"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
