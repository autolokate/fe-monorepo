export interface WhyItMattersStat {
  value: string;
  label: string;
}

export interface WhyItMattersHalf {
  lead: string;
  emphasis: string;
  body: string;
}

export interface WhyItMattersCrash {
  headline: string;
  brand: string;
  body: string;
}

export interface WhyItMattersCopy {
  eyebrow: string;
  stat: WhyItMattersStat;
  half: WhyItMattersHalf;
  crash: WhyItMattersCrash;
  footer: string;
}
