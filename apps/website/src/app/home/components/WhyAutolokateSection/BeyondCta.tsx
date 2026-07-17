'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { WHY_AUTOLOKATE_COPY } from './constants';

export function BeyondCta() {
  const router = useRouter();
  return (
    <AlButton
      size="md"
      variant="primary"
      radius="lg"
      icon={<ArrowRight className="h-4 w-4" aria-hidden />}
      iconPosition="end"
      onClick={() => {
        router.push(WHY_AUTOLOKATE_COPY.cta.href);
      }}
    >
      {WHY_AUTOLOKATE_COPY.cta.label}
    </AlButton>
  );
}
