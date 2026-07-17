export interface NotFoundCta {
  label: string;
  href: string;
}

export interface NotFoundCopy {
  eyebrow: string;
  codePrefix: string;
  codeAccent: string;
  codeSuffix: string;
  headline: string;
  description: string;
  primaryCta: NotFoundCta;
  secondaryCta: NotFoundCta;
}
