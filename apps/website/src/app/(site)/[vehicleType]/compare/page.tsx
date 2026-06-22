import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ComparePageContent } from "@/components/compare";
import type { VehicleCategory } from "@/lib/preferences";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { params: Promise<{ vehicleType: string }> };

function isVehicleCategory(v: string): v is VehicleCategory {
  return v === "cars" || v === "bikes";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vehicleType } = await params;
  if (!isVehicleCategory(vehicleType)) return { title: "Not found" };

  const noun = vehicleType === "cars" ? "cars" : "bikes";
  return {
    title: `Compare ${noun} – Autolokate`,
    description: `Compare up to three ${noun} side by side — specs, features, and indicative prices from the catalogue.`,
  };
}

function CompareFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <Skeleton className="mt-12 h-96 w-full rounded-2xl" />
    </div>
  );
}

export default async function VehicleCompareRoutePage({ params }: Props) {
  const { vehicleType } = await params;
  if (!isVehicleCategory(vehicleType)) notFound();

  return (
    <Suspense fallback={<CompareFallback />}>
      <ComparePageContent vehicleCategory={vehicleType} />
    </Suspense>
  );
}
