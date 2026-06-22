/** Curated quick-pick cities shown above the free-text input for the "city" step. */
export const QUICK_PICK_CITIES: string[] = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
];

export const WIZARD_COPY = {
  loggedOutEyebrow: "Preference finder",
  loggedOutTitle: "Shortlist with intent — not another filter maze.",
  loggedOutDescription:
    "City, body, fuel & budget — wired to live listings so every match stays real.",
  loggedOutCtaPrimary: { label: "Log in", href: "/auth/login" },
  loggedOutCtaSecondary: { label: "Explore by brand", href: "/how-qr-works" },
  loggedOutBullets: [
    { title: "Live ranking", body: "Updates each step — no stale top picks." },
    { title: "Saved on sign-in", body: "Matches + summary; edit anytime." },
    { title: "To the model page", body: "Specs, price band, full detail." },
  ],
  smartFinderTitle: "Smart Car Finder",
  /** Fallback when the API has only hydrated the current step — avoids “1 of 1 / 100%” on step 1. */
  estimatedWizardSteps: 4,
  retryLabel: "Retry",
  loadingLabel: "Loading questionnaire…",
  emptyStateTitle: "All set — your preferences are saved.",
  emptyStateDescription:
    "View your matches below, or start over to rerun the questionnaire with different answers.",
  startOverLabel: "Start over",
  viewMatchesLabel: "View matches",
} as const;
