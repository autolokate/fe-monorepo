import {
  Ambulance,
  ArrowLeftRight,
  ClipboardCheck,
  Hammer,
  History,
  Newspaper,
  PhoneCall,
  ReceiptText,
  ShieldCheck,
  Siren,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const COMPARE_COPY = {
  heading: "Compare plans",
  collapsedLabel: "View all features",
  expandedLabel: "Show fewer features",
} as const;

export interface ComparePlan {
  id: string;
  name: string;
  price: string;
  popular?: boolean;
}

/** Column order — every row's `cells` array aligns to this order. */
export const COMPARE_PLANS: ComparePlan[] = [
  { id: "free", name: "Free", price: "" },
  { id: "starter", name: "Starter", price: "₹99" },
  { id: "shield", name: "Shield", price: "₹299", popular: true },
  { id: "shield-plus", name: "Shield+", price: "₹599" },
];

/**
 * A cell is one of:
 *  - `true`      → included (green check)
 *  - `false`     → not included (dash)
 *  - `"partial"` → limited / partial support
 *  - `{ badge }` → dark pill (e.g. "Priority", "Extended")
 *  - `{ price }` → an add-on price (e.g. "₹499")
 */
export type CompareCell =
  | boolean
  | "partial"
  | { badge: string }
  | { price: string };

export interface CompareRow {
  id: string;
  label: string;
  sub: string;
  Icon: LucideIcon;
  cells: CompareCell[];
}

export interface CompareGroup {
  id: string;
  title: string;
  rows: CompareRow[];
}

export const COMPARE_GROUPS: CompareGroup[] = [
  {
    id: "safety",
    title: "Safety & emergency",
    rows: [
      {
        id: "emergency-alert",
        label: "Emergency alert",
        sub: "Photo + GPS to family",
        Icon: Siren,
        cells: [false, "partial", true, true],
      },
      {
        id: "parking-masked-call",
        label: "Parking masked call",
        sub: "Your number stays private",
        Icon: PhoneCall,
        cells: [false, true, true, true],
      },
      {
        id: "ambulance-dispatch",
        label: "Ambulance dispatch",
        sub: "From the scanner page",
        Icon: Ambulance,
        cells: [false, false, true, { badge: "Priority" }],
      },
      {
        id: "rsa",
        label: "Roadside assistance (RSA)",
        sub: "Towing, fuel & jump-start",
        Icon: Wrench,
        cells: [false, false, false, true],
      },
    ],
  },
  {
    id: "insurance",
    title: "Insurance & compliance",
    rows: [
      {
        id: "group-accident-policy",
        label: "Group accident policy",
        sub: "Personal accident cover",
        Icon: ShieldCheck,
        cells: [false, false, true, { badge: "Extended" }],
      },
      {
        id: "insurance-management",
        label: "Insurance management & renewal",
        sub: "Store & renew on time",
        Icon: ClipboardCheck,
        cells: [false, false, true, true],
      },
      {
        id: "challan-puc",
        label: "Challan & PUC alerts (Vahan)",
        sub: "Stay compliant, stress-free",
        Icon: ReceiptText,
        cells: [false, false, true, true],
      },
      {
        id: "service-history",
        label: "Vehicle service history",
        sub: "Track & share easily",
        Icon: History,
        cells: [false, false, true, true],
      },
    ],
  },
  {
    id: "community",
    title: "Community & utility",
    rows: [
      {
        id: "mod-feed",
        label: "Modification feed (browse)",
        sub: "Explore builds & ideas",
        Icon: Newspaper,
        cells: [true, true, true, true],
      },
      {
        id: "mod-booking",
        label: "Modification booking + post",
        sub: "Book & share your build",
        Icon: Hammer,
        cells: [false, true, true, true],
      },
      {
        id: "ev-fuel",
        label: "EV stations + premium fuel finder",
        sub: "Find charging & fuel",
        Icon: Zap,
        cells: [false, false, true, true],
      },
      {
        id: "qr-transfer",
        label: "Used car QR transfer",
        sub: "Resale & ownership move",
        Icon: ArrowLeftRight,
        cells: [false, { price: "₹499" }, { price: "₹349" }, { price: "₹199" }],
      },
    ],
  },
];
