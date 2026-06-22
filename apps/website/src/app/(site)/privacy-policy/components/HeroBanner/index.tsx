import { CalendarDays, FileText, ShieldCheck } from "lucide-react";
import { LegalHeroBanner } from "@/components/legal/LegalHeroBanner";
import {
  PRIVACY_EFFECTIVE_DATE,
  PRIVACY_LAST_UPDATED,
} from "../PolicyContent/constants";

export function HeroBanner() {
  return (
    <LegalHeroBanner
      badgeLabel="Privacy First"
      BadgeIcon={ShieldCheck}
      title="Privacy Policy"
      description="Your privacy matters. This policy explains what information Autolokate collects, how we use it, and the choices you have to stay in control of your data."
      meta={[
        {
          label: "Last updated",
          value: PRIVACY_LAST_UPDATED,
          Icon: CalendarDays,
        },
        {
          label: "Effective from",
          value: PRIVACY_EFFECTIVE_DATE,
          Icon: CalendarDays,
        },
        { label: "Version", value: "v1.0", Icon: FileText },
      ]}
    />
  );
}
