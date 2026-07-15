import {
  CircleParking,
  Nfc,
  QrCode,
  ReceiptText,
  RefreshCw,
  Video,
  type LucideIcon,
} from 'lucide-react';

export const EVERYONE_GETS_COPY = {
  heading: 'What everyone gets',
  description: 'QR ID, Park Me, dashcam, renewals, challan, FASTag, community, service history.',
} as const;

export interface EveryoneGetsIcon {
  id: string;
  label: string;
  Icon: LucideIcon;
}

export const EVERYONE_GETS_ICONS: EveryoneGetsIcon[] = [
  { id: 'qr-id', label: 'QR ID', Icon: QrCode },
  { id: 'park-me', label: 'Park Me', Icon: CircleParking },
  { id: 'dashcam', label: 'Dashcam', Icon: Video },
  { id: 'renewals', label: 'Renewals', Icon: RefreshCw },
  { id: 'challan', label: 'Challan', Icon: ReceiptText },
  { id: 'fastag', label: 'FASTag', Icon: Nfc },
];
