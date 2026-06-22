import { env } from "@/config/env.config";

/** Base URL without trailing slash — shared by server-side catalogue fetches. */
export function catalogueApiBase(): string {
  return env.NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL.replace(/\/$/, "");
}

function pickBrandNameFromPayload(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const row = details as Record<string, unknown>;
  const name = row.brand_name ?? row.name ?? row.title;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

/**
 * Lightweight brand fetch for `generateMetadata` (no axios, no cookie auth).
 */
export async function fetchBrandNameForMeta(brandSlug: string): Promise<string | null> {
  const trimmed = brandSlug.trim();
  if (!trimmed) return null;
  try {
    const res = await fetch(
      `${catalogueApiBase()}/v1/catalogue/brands/${encodeURIComponent(trimmed)}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const json = (await res.json().catch(() => null)) as { data?: unknown } | null;
    return pickBrandNameFromPayload(json?.data ?? null);
  } catch {
    return null;
  }
}
