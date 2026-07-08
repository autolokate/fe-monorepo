import type { FromOwnerCopy } from "./types";

/** In-page anchor. */
export const FROM_OWNER_SECTION_ID = "from-owner";

/** Theme-neutral lavender plates (orbit + dots + glow are baked in). */
export const FROM_OWNER_BACKGROUND = {
  web: "/images/new-design/homrFromOwnerWeb.png",
  mobile: "/images/new-design/homrFromOwnerMobile.png",
};

/** Founder cut-out (square, light plate — masked to blend into the glow). */
export const FROM_OWNER_IMAGE = "/images/founder_light.png";

export const FROM_OWNER_COPY: FromOwnerCopy = {
  eyebrowIndex: "09",
  eyebrowLabel: "Where it came from",
  headlineLine1: "Built with drivers.",
  headlineLine2Prefix: "Led by ",
  headlineEmphasis: "purpose",
  headlineLine2Suffix: ".",
  body: "Autolokate began with a simple goal — make help, identity, and protection accessible for every vehicle owner in India.",
  pullQuote: "We wanted safety to feel simple, human, and always within reach.",
  floatingQuote: "Autolokate is built to protect every journey.",
  founderName: "Deepak Chaudhary",
  founderRole: "Founder, Autolokate",
  stat: {
    value: "3.5M+",
    label: "drivers inspired the mission",
  },
};
