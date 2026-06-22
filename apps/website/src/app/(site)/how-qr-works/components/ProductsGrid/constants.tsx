export interface ShopProduct {
  key: "bike" | "car";
  badge: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
}

export const PRODUCTS_SECTION_COPY = {
  eyebrow: "Buy Autolokate QR",
  headline: "Choose the QR made for your vehicle.",
  subheading:
    "Pick the right Autolokate QR sticker for your bike, scooter, or car. Each QR connects your vehicle to parking help, emergency contacts, and important vehicle details.",
  footerNote:
    "You'll complete your purchase and delivery on the official Autolokate shop.",
} as const;

export const products: ShopProduct[] = [
  {
    key: "bike",
    badge: "TWO-WHEELER",
    title: "QR Code for Bike / Scooter",
    description:
      "Compact QR sticker designed for bikes and scooters. Easy to place, simple to scan, and built for everyday parking and emergency access.",
    image: "/images/qr_b.png",
    imageAlt: "Autolokate QR sticker for bikes and scooters",
    ctaLabel: "Buy Bike QR",
    ctaHref: "https://shop.autolokate.com/products/qr-code-for-bike-scooter",
  },
  {
    key: "car",
    badge: "FOUR-WHEELER",
    title: "QR Code for Car",
    description:
      "Larger QR sticker designed for cars with better visibility. Helps people reach you for parking issues and access emergency support when needed.",
    image: "/images/qr_c.png",
    imageAlt: "Autolokate QR sticker for cars",
    ctaLabel: "Buy Car QR",
    ctaHref: "https://shop.autolokate.com/products/qr-code-for-car",
  },
];
