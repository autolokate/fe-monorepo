export interface HeroCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  description: string;
  /** Callout parts: plain segments interleaved with green-accented highlights. */
  callout: HeroCalloutPart[];
}

export interface HeroCalloutPart {
  text: string;
  accent?: boolean;
}
