export interface FaqItem {
  q: string;
  a: string;
}

export const faqs: { left: FaqItem[]; right: FaqItem[] } = {
  left: [
    {
      q: "What is Autolokate?",
      a: "Autolokate is a sticker-first vehicle safety and emergency response platform. A smart QR sticker on your vehicle connects owners, bystanders, emergency contacts, and support — with a scanner web page that works without an app download.",
    },
    {
      q: "Is Autolokate free to use?",
      a: "You can get started through the smart QR sticker and core safety features. Premium sticker packs and advanced partner services depend on your plan and availability in your area.",
    },
    {
      q: "How does the emergency contact system work?",
      a: "You add trusted contacts who must accept the invitation. When your sticker is scanned in an emergency, they can be notified through the channels you've enabled. We never replace official emergency services.",
    },
    {
      q: "What information is shown when someone scans my sticker?",
      a: "Only what you've allowed for that situation — such as ways to reach you, Park Me, or emergency guidance. Sensitive details stay protected based on your settings, plan, and context.",
    },
  ],
  right: [
    {
      q: "Do I need a QR sticker to use Autolokate?",
      a: "Yes. Phase 1 is sticker-first — you activate a smart QR sticker on your vehicle to connect scanning, emergency contacts, and support flows. Bystanders can use the scanner web page without downloading an app.",
    },
    {
      q: "Is my data safe and private?",
      a: "Yes. We follow privacy-first principles: data is encrypted at rest and in transit, sharing is controlled by your permissions and plan, and features like Park Me use masked calling to protect your number.",
    },
    {
      q: "Does Autolokate replace emergency services?",
      a: "No. Autolokate is never a substitute for the police, ambulance, or fire services. Always contact official emergency services first; we help notify trusted contacts and coordinate support faster.",
    },
    {
      q: "Can I use Autolokate offline?",
      a: "Scanning and emergency flows need a connection. Your saved vehicle records and contact settings may remain readable offline once cached on your device.",
    },
  ],
};
