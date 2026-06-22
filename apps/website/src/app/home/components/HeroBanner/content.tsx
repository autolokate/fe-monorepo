"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BookOpen, ChevronRight, Flame } from "lucide-react";
import { useTrendingModels } from "@/hooks/catalogue";
import { formatINR } from "@/lib/utils";
import type { CatalogueModel } from "@/lib/catalogue/types";
import { TRENDING_MODELS } from "./constants";
import type { TrendingModel } from "./types";
import styles from "./index.module.css";

function toTrendingItems(models: CatalogueModel[]): TrendingModel[] {
  return models.slice(0, 3).map((m, idx) => {
    const min = typeof m.min_price === "number" ? m.min_price : null;
    const max = typeof m.max_price === "number" ? m.max_price : null;
    let priceLabel = "Price on request";
    if (min && max && max > min) {
      priceLabel = `${formatINR(min)} – ${formatINR(max)}`;
    } else if (min) {
      priceLabel = `From ${formatINR(min)}`;
    }
    const href =
      m.brand_slug && m.model_slug
        ? `/cars/${encodeURIComponent(m.brand_slug)}/${encodeURIComponent(m.model_slug)}`
        : m.model_slug
          ? `/cars/${encodeURIComponent(m.model_slug)}`
          : "/how-qr-works";
    const subtitle = [m.body_type, ...(m.fuel_types ?? [])]
      .filter((s): s is string => Boolean(s))
      .slice(0, 3)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join(" · ");

    return {
      id: typeof m.id === "string" ? m.id : `${m.brand_slug ?? "model"}-${m.model_slug ?? idx}`,
      href,
      title: [m.brand_name, m.model_name].filter(Boolean).join(" ") || m.model_name,
      subtitle: subtitle || "New model",
      imageUrl: typeof m.hero_image_url === "string" ? m.hero_image_url : undefined,
      imageAlt: m.model_name,
      priceLabel,
    };
  });
}

/**
 * Right-side trending card. Pulls from `/v1/catalogue/trending` when available
 * and falls back to a curated static list so the hero never looks empty.
 */
export function TrendingModelsCard() {
  const { data, isError } = useTrendingModels();
  const items = useMemo<TrendingModel[]>(() => {
    if (!data || data.length === 0 || isError) return TRENDING_MODELS;
    const mapped = toTrendingItems(data);
    return mapped.length > 0 ? mapped : TRENDING_MODELS;
  }, [data, isError]);

  return (
    <aside
      aria-label="Trending models in the catalogue"
      className="relative w-full overflow-hidden rounded-3xl border border-border/80 bg-card/95 p-5 shadow-hero-card ring-1 ring-foreground/[0.04] backdrop-blur-md sm:p-6"
    >
      <div
        className="ambient-blob-primary right-[-3rem] top-[-3.5rem] h-32 w-32"
        aria-hidden
      />

      <div className="relative mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          Trending Models
        </h3>
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15"
          aria-hidden
        >
          <Flame className="h-3.5 w-3.5" />
        </span>
      </div>

      <ul className="relative space-y-2.5">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-background/40 p-2.5 transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-background hover:shadow-md motion-reduce:hover:translate-y-0"
            >
              <div className={styles.thumb}>
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="80px"
                    className="object-cover transition duration-500 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-muted/50 via-muted/70 to-muted/40" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold text-foreground sm:text-[0.95rem]">
                  {item.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[11px] uppercase tracking-wide text-muted-foreground sm:text-[12px]">
                  {item.subtitle}
                </p>
                <p className="mt-1 line-clamp-1 text-[12px] font-medium tabular-nums text-foreground/85 sm:text-[13px]">
                  {item.priceLabel}
                </p>
              </div>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:group-hover:translate-x-0"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>

      <div className="relative mt-4 border-t border-border/70 pt-3">
        <Link
          href="/how-qr-works"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          View all models
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
