'use client';

import { useRouter } from 'next/navigation';
import { AlButton } from '@autolokate/ui/button';
import styles from './index.module.css';

interface CompareCtaProps {
  label: string;
  href: string;
  popular?: boolean;
}

export function CompareCta({ label, href, popular }: CompareCtaProps) {
  const router = useRouter();

  return (
    <AlButton
      size="lg"
      radius="lg"
      variant={popular ? 'primary' : 'secondary'}
      className={popular ? styles.ctaPrimary : styles.ctaSecondary}
      onClick={() => {
        router.push(href);
      }}
    >
      {label}
    </AlButton>
  );
}
