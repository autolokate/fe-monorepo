import type { Metadata } from "next";

import { humanizeSegment } from "@/components/catalogue/BrandModelsPage/model-utils";
import { ModelDetailPage } from "@/components/catalogue/ModelDetailPage";

type Props = { params: Promise<{ brandSlug: string; modelSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug, modelSlug } = await params;
  const brand = humanizeSegment(decodeURIComponent(brandSlug));
  const model = humanizeSegment(decodeURIComponent(modelSlug));
  const title = `${model} | ${brand} — Autolokate`;
  return {
    title,
    description: `${model} price, specs, variants, and ownership costs in India — Autolokate.`,
  };
}

export default async function CarModelDetailRoute({ params }: Props) {
  const { brandSlug, modelSlug } = await params;
  return (
    <main className="relative min-h-screen">
      <ModelDetailPage brandSlug={brandSlug} modelSlug={modelSlug} />
    </main>
  );
}
