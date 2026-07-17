'use client';

import { ServerErrorContent } from './(site)/500';
import { Chrome } from '@/layouts';

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ reset }: RootErrorProps) {
  return (
    <Chrome>
      <ServerErrorContent onTryAgain={reset} />
    </Chrome>
  );
}
