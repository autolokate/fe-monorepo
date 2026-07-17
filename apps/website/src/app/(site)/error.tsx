'use client';

import { ServerErrorContent } from './500';

interface SiteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SiteError({ reset }: SiteErrorProps) {
  return <ServerErrorContent onTryAgain={reset} />;
}
