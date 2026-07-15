import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { PurchaseFlow, purchaseMetadata } from './';

export const metadata = purchaseMetadata;

function PurchaseFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
    </div>
  );
}

export default function PurchasePage() {
  return (
    <Suspense fallback={<PurchaseFallback />}>
      <PurchaseFlow />
    </Suspense>
  );
}
