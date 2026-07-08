export const FAQ_COPY = {
  heading: "FAQs",
} as const;

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQS: { left: FaqItem[]; right: FaqItem[] } = {
  left: [
    {
      id: "install-device",
      question: "Do I need to install any device in my vehicle?",
      answer:
        "No hardware installation is required. Autolokate works through a smart QR sticker and your phone's sensors — just place the sticker and activate it.",
    },
    {
      id: "scan-without-app",
      question: "Can I scan the QR sticker without installing any app?",
      answer:
        "Yes. Anyone can scan the QR sticker using any phone's camera and reach help instantly — no app download needed.",
    },
    {
      id: "number-privacy",
      question: "Will my personal number be visible to strangers?",
      answer:
        "No. Your personal number stays private. Contact happens through a masked call or our Control Center, so strangers never see your real number.",
    },
  ],
  right: [
    {
      id: "crash-coverage",
      question: "Where does crash detection work?",
      answer:
        "Crash detection runs in the background using GPS and motion sensors wherever your phone has network coverage, so help can be triggered on the road.",
    },
    {
      id: "plan-coverage",
      question: "Which plans include crash detection and QR features?",
      answer:
        "Crash detection is included in the Secure tier and above, while the Smart QR backup features are available across plans. See pricing for the full breakdown.",
    },
  ],
};
