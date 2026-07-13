import Image from "next/image";
import { PARTNER_BANNER_BACKGROUND, PARTNER_BANNER_COPY, PARTNER_CATEGORIES } from "./constants";

export function PartnerNetworkBanner() {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl bg-[#0a0a0a] px-5 py-4 text-white sm:rounded-3xl sm:px-6 sm:py-5 lg:px-8 lg:py-5">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={PARTNER_BANNER_BACKGROUND}
          alt=""
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-[70%_center] opacity-[0.06]"
        />
      </div>

      <div className="relative z-10 flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center lg:gap-7">
        <div className="min-w-0 lg:max-w-[20rem] lg:shrink-0 xl:max-w-[22rem]">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--al-signal-green)] sm:text-[11px]">
            {PARTNER_BANNER_COPY.eyebrow}
          </p>
          <h3 className="font-display mt-2 text-xl font-bold leading-tight tracking-tight sm:text-2xl">
            {PARTNER_BANNER_COPY.headline}
          </h3>
          <p className="mt-2 text-[13px] leading-snug text-white/72 sm:text-sm">
            {PARTNER_BANNER_COPY.body}
          </p>
        </div>

        <div
          aria-hidden
          className="hidden h-[4.5rem] w-px shrink-0 self-center bg-white/15 lg:block"
        />

        <ul className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-6 sm:gap-y-0 lg:flex-1 lg:gap-x-2 xl:gap-x-4">
          {PARTNER_CATEGORIES.map(({ id, label, Icon }) => (
            <li key={id} className="flex flex-col items-center text-center">
              <span
                className="flex h-8 w-8 items-center justify-center text-[var(--al-signal-green)] sm:h-9 sm:w-9"
                aria-hidden
              >
                <Icon className="h-5 w-5 stroke-[1.5] sm:h-[1.35rem] sm:w-[1.35rem]" />
              </span>
              <span className="mt-1 max-w-[5.5rem] text-[10px] leading-tight text-white/75 sm:max-w-none sm:text-[10.5px]">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
