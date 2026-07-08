"use client";

import { useRouter } from "next/navigation";
import { QrCode } from "lucide-react";
import { AlButton } from "@autolokate/ui/button";
import { QR_SECTION_COPY } from "./constants";

/** Primary CTA wired to the shared design-system button (matches hero/header). */
export function QrCta() {
  const router = useRouter();

  return (
    <AlButton
      size="lg"
      variant="primary"
      className="mt-8"
      icon={<QrCode className="h-4 w-4" aria-hidden />}
      onClick={() => router.push(QR_SECTION_COPY.primaryCta.href)}
    >
      {QR_SECTION_COPY.primaryCta.label}
    </AlButton>
  );
}
