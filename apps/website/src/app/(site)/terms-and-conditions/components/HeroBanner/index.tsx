import { CalendarDays, FileText, Scale } from "lucide-react";
import { LegalHeroBanner } from "@/components/legal/LegalHeroBanner";
import {
  TC_EFFECTIVE_DATE,
  TC_LAST_UPDATED,
} from "../TermsContent/constants";

export function HeroBanner() {
  return (
    <LegalHeroBanner
      badgeLabel="Legal"
      BadgeIcon={Scale}
      title="Terms & Conditions"
      description="The general rules of the road for using Autolokate — from account access and prohibited conduct to QR-sticker usage, liability, and governing law."
      meta={[
        {
          label: "Last updated",
          value: TC_LAST_UPDATED,
          Icon: CalendarDays,
        },
        {
          label: "Effective from",
          value: TC_EFFECTIVE_DATE,
          Icon: CalendarDays,
        },
        { label: "Version", value: "v1.0", Icon: FileText },
      ]}
    />
  );
}
