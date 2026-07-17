export interface MechanicsFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface MechanicsFaqCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  note: string;
  noteLink: {
    label: string;
    href: string;
  };
}
