import type { ComponentType, SVGProps } from "react";

/** Minimal brand marks — keep stroke consistent with lucide sizing. */
export function YoutubeIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58Z" />
      <path d="m9.75 15.02 5.5-3.02-5.5-3.02v6.04Z" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M13.5 9H15V6.5c0-.3 0-1 .1-1.4.2-1.5 1.1-2.9 2.4-3.6 1-.6 2.2-.8 3.5-.8V0h-2.2c-2.4 0-4.6 1-5.9 2.9-.7 1-1 2.1-1 3.5V9h-3v4h3v11h4V13h3.1l.2-4h-3.4V7.2c0-.5 0-1 .2-1.4.3-.8 1-1.2 2-1.2.1 0 .8 0 1.5.1V9z" />
    </svg>
  );
}

export function InstagramIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.4 3.4 0 0 0 4 7.4v9.2A3.4 3.4 0 0 0 7.4 20h9.2a3.4 3.4 0 0 0 3.4-3.4V7.4A3.4 3.4 0 0 0 16.6 4H7.6m9.9 1.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  );
}

export function LinkedInIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.55V9h3.57v11.45ZM22 0H2C.9 0 0 .9 0 2v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2Z" />
    </svg>
  );
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterLinkSection {
  title: string;
  links: FooterLink[];
}

export const footerLinks: FooterLinkSection[] = [
  {
    title: "Platform",
    links: [
      { id: "about", label: "About Us", href: "/about-us" },
      { id: "how-it-works", label: "How It Works", href: "/how-it-works" },
      { id: "products", label: "Products", href: "/products" },
      { id: "safety", label: "Emergency & Safety", href: "/safety" },
      { id: "pricing", label: "Pricing", href: "/pricing" },
      { id: "explore", label: "Explore Cars", href: "/explore" },
      { id: "compare", label: "Compare Cars", href: "/compare" },
      { id: "media", label: "Media", href: "/media" },
    ],
  },
  {
    title: "Support",
    links: [
      { id: "contact", label: "Contact Us", href: "/contact-us" },
      { id: "book-session", label: "Book a session", href: "/book-session" },
    ],
  },
  {
    title: "Legal",
    links: [
      { id: "privacy", label: "Privacy Policy", href: "/privacy-policy" },
      { id: "terms-conditions", label: "Terms & Conditions", href: "/terms-and-conditions" },
    ],
  },
];

export const INSTAGRAM_URL =
  "https://www.instagram.com/autolokate?igsh=eW9taGQyMnJhYWl6";
export const LINKEDIN_URL = "https://www.linkedin.com/company/autolokate/";

export interface SocialLink {
  id: "instagram" | "youtube" | "facebook" | "linkedin";
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Official brand color for the icon. */
  brandColor: string;
}

export const socialLinks: SocialLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    href: INSTAGRAM_URL,
    Icon: InstagramIcon,
    brandColor: "#E4405F",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@IndianDriveGuide",
    Icon: YoutubeIcon,
    brandColor: "#FF0000",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/",
    Icon: FacebookIcon,
    brandColor: "#1877F2",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: LINKEDIN_URL,
    Icon: LinkedInIcon,
    brandColor: "#0A66C2",
  },
];

export const footerBrand = {
  name: "Autolokate",
  legalName: "Autolokate Software Private Limited",
  tagline:
    "India's premier vehicle safety platform. Connect, manage, and protect your vehicles with smart QR technology.",
};

export const FOOTER_BACKGROUND = "/images/footer/footer_bg.png";

export const ANDROID_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.mycompany.indiandriveguide";
export const IOS_STORE_URL = "https://apps.apple.com/in/app/idg-autolokate/id6733244175";

export const footerDownload = {
  title: "Download App",
  androidUrl: ANDROID_STORE_URL,
  iosUrl: IOS_STORE_URL,
};

export function GooglePlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={className}>
      <path d="M325.3 234.3 104.3 13.3l219.2 126.6-83.7 94.4 85.5 0z" fill="#34A853" />
      <path
        d="M104.3 13.3a36 36 0 0 0-19 31.2v423a36 36 0 0 0 19 31.2L325.3 277.7l-83.6-94.4-137.4-169.9z"
        fill="#4285F4"
      />
      <path d="M325.3 277.7 104.3 498.7l219.2-126.6 83.7-94.4-81.9 0z" fill="#FBBC05" />
      <path
        d="m407.2 277.7 80.7-46.6c19-11 19-39.1 0-50.1l-80.7-46.6-83.6 94.4 83.6 48.9z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" aria-hidden fill="currentColor" className={className}>
      <path d="M318.7 268.7c-.3-36.7 16.4-64.4 50.2-84.8-18.9-27-47.5-41.9-85.2-44.8-35.7-2.8-74.7 21.1-89 21.1-15.1 0-49.7-20.1-76.8-20.1C70.8 141.6 16 184.3 16 271.5c0 25.8 4.7 52.4 14.1 79.7 12.6 36 56.4 124 102.1 122.5 24-.5 40.9-17 72.2-17 30.4 0 46 17 72.7 17 46.1-.7 85.7-80.6 97.7-116.7-64.4-30.4-56.1-89-56.1-87.3zM254.6 96.3c30.9-36.7 28.1-70.1 27.2-82.1-27.4 1.6-59.1 18.7-77.2 39.7-19.9 22.5-31.6 50.3-29.1 81.5 29.7 2.3 56.8-13 79.1-39.1z" />
    </svg>
  );
}
