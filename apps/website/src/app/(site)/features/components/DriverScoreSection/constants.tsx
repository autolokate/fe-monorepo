import type { PhoneShot } from "../PhoneCarousel";

export const DRIVER_SCORE_COPY = {
  index: "04",
  heading: "Driver Score",
  description: "Understand your driving. Improve with every trip.",
} as const;

export interface ChecklistItem {
  id: string;
  label: string;
}

export const DRIVER_SCORE_CHECKLIST: ChecklistItem[] = [
  { id: "ai-score", label: "AI-powered driving score" },
  { id: "leaderboard", label: "Leaderboard & comparisons" },
  { id: "tips", label: "Personalized improvement tips" },
];

export const DRIVER_SCORE_PHONE_SHOTS: PhoneShot[] = [
  {
    id: "drive-score",
    src: "/images/new-design/feedbackFirstSectionImage8.png",
    alt: "Autolokate Drive Score card showing an overall score of 82 with braking, acceleration, speed, and distraction breakdowns",
  },
  {
    id: "leaderboard",
    src: "/images/new-design/feedbackFirstSectionImage9.png",
    alt: "Autolokate Leaderboard screen ranking drivers by weekly driving score",
  },
];

export const DRIVER_SCORE_ASIDE = {
  heading: "Drive better. Earn higher.",
  description: "Better habits. Safer roads. Stronger community.",
} as const;
