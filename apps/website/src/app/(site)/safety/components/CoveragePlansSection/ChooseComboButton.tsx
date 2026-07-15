'use client';

import { useRouter } from 'next/navigation';
import { AlButton } from '@autolokate/ui/button';
import { COVERAGE_COPY } from './constants';

export function ChooseComboButton() {
  const router = useRouter();

  return (
    <AlButton size="md" variant="primary" onClick={() => router.push(COVERAGE_COPY.combo.cta.href)}>
      {COVERAGE_COPY.combo.cta.label}
    </AlButton>
  );
}
