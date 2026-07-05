"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Download } from "lucide-react";
import { AlButton } from "@autolokate/ui/button";
import { CTA_COPY } from "./constants";
import styles from "./index.module.css";

export function CtaActions() {
  const router = useRouter();

  return (
    <div className={styles.ctas}>
      <AlButton
        size="md"
        variant="primary"
        className={styles.ctaPrimary}
        icon={<ArrowRight className="h-4 w-4" />}
        iconPosition="end"
        onClick={() => router.push(CTA_COPY.primaryCta.href)}
      >
        {CTA_COPY.primaryCta.label}
      </AlButton>

      <AlButton
        size="md"
        variant="outline"
        className={styles.ctaSecondary}
        icon={<Download className="h-4 w-4" />}
        onClick={() => router.push(CTA_COPY.secondaryCta.href)}
      >
        {CTA_COPY.secondaryCta.label}
      </AlButton>
    </div>
  );
}
