import { CalendarDays, FileText, ScrollText } from "lucide-react";
import { LegalHeroBanner } from "@/components/legal/LegalHeroBanner";
import {
  TERMS_EFFECTIVE_DATE,
  TERMS_LAST_UPDATED,
} from "../TermsContent/constants";

export function HeroBanner() {
  return (
    <LegalHeroBanner
      badgeLabel="Legal"
      BadgeIcon={ScrollText}
      title="Terms of Service"
      description="These Terms describe the rules for using Autolokate — from account access and purchases to acceptable use and dispute resolution. Please read them carefully."
      meta={[
        {
          label: "Last updated",
          value: TERMS_LAST_UPDATED,
          Icon: CalendarDays,
        },
        {
          label: "Effective from",
          value: TERMS_EFFECTIVE_DATE,
          Icon: CalendarDays,
        },
        { label: "Version", value: "v1.0", Icon: FileText },
      ]}
    />
  );
}
