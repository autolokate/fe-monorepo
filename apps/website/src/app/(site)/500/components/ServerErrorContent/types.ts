export interface ServerErrorCtaLink {
  label: string;
  href: string;
}

export interface ServerErrorCtaAction {
  label: string;
}

export interface ServerErrorCopy {
  eyebrow: string;
  headline: string;
  description: string;
  primaryCta: ServerErrorCtaAction;
  secondaryCta: ServerErrorCtaLink;
}

export interface ServerErrorContentProps {
  onTryAgain?: () => void;
}
