'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { QR_SECTION_COPY } from './constants';

export function QrCta() {
  const router = useRouter();

  return (
    <AlButton
      size="md"
      variant="primary"
      radius="lg"
      icon={<ArrowRight className="h-4 w-4" aria-hidden />}
      iconPosition="end"
      onClick={() => {
        router.push(QR_SECTION_COPY.primaryCta.href);
      }}
    >
      {QR_SECTION_COPY.primaryCta.label}
    </AlButton>
  );
}
