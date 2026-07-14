import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { MyOrders, myOrdersMetadata } from "./";

export const metadata = myOrdersMetadata;

function MyOrdersFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense fallback={<MyOrdersFallback />}>
      <MyOrders />
    </Suspense>
  );
}
