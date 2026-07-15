import { Car, Phone, QrCode, ShieldCheck, Users, Wallet, type LucideIcon } from 'lucide-react';

export interface Feature {
  Icon: LucideIcon;
  title: string;
  body: string;
}

export const features: Feature[] = [
  {
    Icon: Car,
    title: 'Vehicle Management',
    body: 'Track vehicle records, service history, and important documents from one calm dashboard.',
  },
  {
    Icon: Users,
    title: 'Community Support',
    body: 'Connect with other vehicle owners through our opt-in community for advice and shared trips.',
  },
  {
    Icon: Wallet,
    title: 'Trip & Expense Sharing',
    body: 'Share trips and expenses with friends, split fuel and tolls, and keep group travel fair.',
  },
  {
    Icon: Phone,
    title: 'Emergency Contacts',
    body: 'Add trusted contacts who can be notified quickly when your vehicle needs assistance.',
  },
  {
    Icon: QrCode,
    title: 'Smart QR Sticker',
    body: 'Activate one sticker on your vehicle to unlock scanning, emergency flows, Park Me, and vehicle-linked records.',
  },
  {
    Icon: ShieldCheck,
    title: 'Privacy First',
    body: "All data stays opt-in. You control what's shared, when, and with whom — no shortcuts.",
  },
];
