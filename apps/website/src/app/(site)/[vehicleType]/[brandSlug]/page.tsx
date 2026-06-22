import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrandModelsPage } from "@/components/catalogue/BrandModelsPage";
import { env } from "@/config/env.config";
import { fetchBrandNameForMeta } from "@/lib/catalogue/brand-catalogue-fetch";
import type { VehicleCategory } from "@/lib/preferences";

type Props = { params: Promise<{ vehicleType: string; brandSlug: string }> };

function isVehicleCategory(v: string): v is VehicleCategory {
  return v === "cars" || v === "bikes";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vehicleType, brandSlug } = await params;
  if (!isVehicleCategory(vehicleType)) {
    return { title: "Not found" };
  }

  const name = await fetchBrandNameForMeta(brandSlug);
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const segment = encodeURIComponent(brandSlug);
  const path = `/${vehicleType}/${segment}`;
  const title = name
    ? `${name} models — Autolokate`
    : `${slugToLabel(decodeURIComponent(brandSlug))} — Autolokate catalogue`;

  return {
    title,
    description: name
      ? `Browse ${name} models in the Autolokate catalogue — specs, body styles, and indicative pricing.`
      : `Browse catalogue models for this brand on Autolokate (${vehicleType}).`,
    alternates: { canonical: path },
    openGraph: {
      title,
      url: `${base}${path}`,
      type: "website",
    },
  };
}

export default async function VehicleBrandHubPage({ params }: Props) {
  const { vehicleType, brandSlug } = await params;
  if (!isVehicleCategory(vehicleType)) notFound();

  return (
    <main className="relative">
      <BrandModelsPage vehicleType={vehicleType} brandSlug={brandSlug} />
    </main>
  );
}

function slugToLabel(slug: string): string {
  try {
    const decoded = decodeURIComponent(slug.trim());
    if (!decoded) return "Brand hub";
    return decoded
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return "Brand hub";
  }
}
