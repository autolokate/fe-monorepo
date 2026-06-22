export interface PhilosophyItem {
  title: string;
  body: string;
}

export const BELIEFS_CARD_TITLE = "What We Believe";

export const beliefs: PhilosophyItem[] = [
  {
    title: "Sticker-first safety",
    body: "Every Autolokate experience starts with one smart QR sticker that connects the vehicle, owner, emergency contacts, and support flow.",
  },
  {
    title: "Help should work without an app",
    body: "In an emergency, a bystander should not need to download anything. The scanner web page should open fast and guide them clearly.",
  },
  {
    title: "Privacy by design",
    body: "Owner details are protected. Features like Park Me use masked calling, so people can reach you without seeing your number.",
  },
  {
    title: "Built around the vehicle",
    body: "Service history, insurance, QR identity, and ownership records stay linked to the vehicle, not just the current owner.",
  },
];

export const IMPORTANT_CARD_TITLE = "Important to Know";

export const importantInfo: PhilosophyItem[] = [
  {
    title: "Autolokate does not replace official emergency services.",
    body: "In any emergency, users should contact police, ambulance, fire, or local emergency services first. Autolokate is designed to help notify trusted contacts and coordinate support faster.",
  },
  {
    title: "Partner services depend on availability.",
    body: "Ambulance dispatch, roadside assistance, insurance support, and legal help depend on the user’s plan, service availability, and active partner coverage.",
  },
  {
    title: "User information must be accurate.",
    body: "Emergency contacts, vehicle details, medical information, and ownership records must be kept updated by the user for the system to work properly.",
  },
  {
    title: "Consent and privacy remain central.",
    body: "Autolokate only shows information based on user permissions, plan features, and emergency context. Users stay in control of what is shared.",
  },
];
