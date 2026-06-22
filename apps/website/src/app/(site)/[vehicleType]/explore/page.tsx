import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogueExplorePage } from "@/components/catalogue/CatalogueExplorePage";
import type { VehicleCategory } from "@/lib/preferences";

type Props = { params: Promise<{ vehicleType: string }> };

function isVehicleCategory(v: string): v is VehicleCategory {
  return v === "cars" || v === "bikes";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vehicleType } = await params;
  if (!isVehicleCategory(vehicleType)) return { title: "Not found" };

  const noun = vehicleType === "cars" ? "cars" : "bikes";
  return {
    title: `Explore all ${noun} • Autolokate catalogue`,
    description: `Browse every ${noun.slice(0, -1)} model in the live Autolokate catalogue — search, filter, and compare prices.`,
  };
}

export default async function CatalogueExploreRoutePage({ params }: Props) {
  const { vehicleType } = await params;
  if (!isVehicleCategory(vehicleType)) notFound();

  return (
    <main className="relative">
      <CatalogueExplorePage vehicleType={vehicleType} />
    </main>
  );
}
