export interface HeroCta {
  label: string;
  href: string;
}

export interface HeroStat {
  id: string;
  value: string;
  label: string;
}

export interface HeroCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheading: string;
  microcopy: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
}
