import type { Metadata } from "next";

export const profileMetadata: Metadata = {
  title: "Profile — Autolokate",
  description:
    "Update your Autolokate profile, contact details, vehicle preferences, and budget.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Profile — Autolokate",
    description: "Manage your Autolokate account preferences.",
    type: "website",
  },
};
