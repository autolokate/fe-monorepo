export interface OfflineCtaLink {
  label: string;
  href: string;
}

export interface OfflineCtaAction {
  label: string;
}

export interface OfflineCopy {
  eyebrow: string;
  headline: string;
  description: string;
  primaryCta: OfflineCtaAction;
  secondaryCta: OfflineCtaLink;
}

export interface OfflineContentProps {
  onTryAgain?: () => void;
}
