'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { SAFETY_PACKS_COPY } from './constants';

export function CompareCta() {
  const router = useRouter();
  const cta = SAFETY_PACKS_COPY.compareCta;
  if (!cta) return null;

  return (
    <AlButton
      size="md"
      variant="primary"
      radius="lg"
      icon={<ArrowRight className="h-4 w-4" aria-hidden />}
      iconPosition="end"
      onClick={() => {
        router.push(cta.href);
      }}
    >
      {cta.label}
    </AlButton>
  );
}
