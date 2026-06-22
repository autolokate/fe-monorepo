import { redirect } from "next/navigation";

/**
 * Legacy `/explore` — catalogue browse now lives under `/cars/explore` and `/bikes/explore`.
 * Defaults to cars; query string is preserved for bookmarks.
 */
export default async function LegacyExploreRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string" && value.trim()) q.set(key, value);
  }
  const qs = q.toString();
  redirect(`/cars/explore${qs ? `?${qs}` : ""}`);
}
