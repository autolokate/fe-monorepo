import { Car, PhoneOff, QrCode, ShieldAlert, ShoppingCart, type LucideIcon } from "lucide-react";
import { HOW_QR_WORKS_SECTION_ID } from "../HowQrWorksSection/constants";

export const SHOP_HERO_BG = "/images/shop/shop_banner_bg.png";

export const SHOP_PRODUCTS_SECTION_ID = "shop-products";

export const SHOP_HERO_COPY = {
  badge: "Smart vehicle QR",
  headline: "Your vehicle stays reachable.",
  headlineAccent: "Your number stays private.",
  subheading:
    "Autolokate QR lets people contact you, alert your emergency contacts, and access key vehicle details — without revealing your personal number.",
  primaryCta: { label: "Buy QR Sticker", href: `#${SHOP_PRODUCTS_SECTION_ID}` },
  secondaryCta: { label: "How QR Works", href: `#${HOW_QR_WORKS_SECTION_ID}` },
} as const;

export interface HeroPerk {
  Icon: LucideIcon;
  label: string;
}

export const heroPerks: HeroPerk[] = [
  { Icon: QrCode, label: "Private scan-to-contact" },
  { Icon: ShieldAlert, label: "Emergency-ready profile" },
  { Icon: PhoneOff, label: "No phone number displayed" },
  { Icon: Car, label: "Works for bikes and cars" },
];

export { ShoppingCart };
