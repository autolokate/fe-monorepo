import type { FeatureNavigation } from "@/navigation/types";

export const howQrWorksNavigation: FeatureNavigation = {
  id: "how-qr-works",
  label: "How QR Works",
  href: "/how-qr-works",
  order: 2,
  showInHeader: true,
  showInFooter: true,
};

/** @deprecated Use howQrWorksNavigation */
export const shopNavigation = howQrWorksNavigation;
