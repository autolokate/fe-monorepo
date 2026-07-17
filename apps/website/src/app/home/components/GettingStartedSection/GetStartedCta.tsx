'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { GETTING_STARTED_COPY } from './constants';

export function GetStartedCta() {
  const router = useRouter();
  return (
    <AlButton
      size="md"
      variant="primary"
      radius="lg"
      icon={<ArrowRight className="h-4 w-4" aria-hidden />}
      iconPosition="end"
      onClick={() => {
        router.push(GETTING_STARTED_COPY.cta.href);
      }}
    >
      {GETTING_STARTED_COPY.cta.label}
    </AlButton>
  );
}
