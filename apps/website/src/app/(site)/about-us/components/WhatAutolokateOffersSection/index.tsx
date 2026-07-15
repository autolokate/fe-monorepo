import {
  OFFER_FEATURES,
  OFFERS_SECTION_COPY,
  WHAT_AUTOLOKATE_OFFERS_SECTION_ID,
} from './constants';
import { OfferCard } from './OfferCard';
import { PartnerNetworkBanner } from './PartnerNetworkBanner';

export function WhatAutolokateOffersSection() {
  return (
    <section
      id={WHAT_AUTOLOKATE_OFFERS_SECTION_ID}
      aria-labelledby="what-autolokate-offers-heading"
      className="bg-background py-10 sm:py-12 lg:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[0.8rem] font-bold uppercase tracking-[0.18em] text-[var(--al-signal-green)]">
            {OFFERS_SECTION_COPY.eyebrow}
          </p>
          <h2
            id="what-autolokate-offers-heading"
            className="font-display mt-3 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.35rem]"
          >
            {OFFERS_SECTION_COPY.headline}
          </h2>
        </header>

        <ul className="mt-8 grid list-none grid-cols-1 gap-4 sm:mt-9 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-4">
          {OFFER_FEATURES.map((feature) => (
            <li key={feature.id}>
              <OfferCard feature={feature} />
            </li>
          ))}
        </ul>

        <div className="mt-6 sm:mt-8">
          <PartnerNetworkBanner />
        </div>
      </div>
    </section>
  );
}
