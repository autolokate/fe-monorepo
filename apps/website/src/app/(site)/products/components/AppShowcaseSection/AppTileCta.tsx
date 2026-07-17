'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import type { AppCta } from './types';
import styles from './index.module.css';

interface AppTileCtaProps {
  cta: AppCta;
  /** `light` renders a white button (dark tile); `dark` renders a black button (light tile). */
  tone: 'light' | 'dark';
}

export function AppTileCta({ cta, tone }: AppTileCtaProps) {
  const router = useRouter();
  const isExternal = /^https?:\/\//.test(cta.href);

  return (
    <AlButton
      size="lg"
      variant="primary"
      radius="lg"
      className={tone === 'light' ? styles.ctaLight : styles.ctaDark}
      icon={<ArrowRight className="h-4 w-4" aria-hidden />}
      iconPosition="end"
      onClick={() => {
        if (isExternal) {
          window.open(cta.href, '_blank', 'noopener,noreferrer');
        } else {
          router.push(cta.href);
        }
      }}
    >
      {cta.label}
    </AlButton>
  );
}
