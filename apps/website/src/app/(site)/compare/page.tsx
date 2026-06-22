import { redirect } from "next/navigation";

/**
 * Legacy `/compare` — catalogue compare now lives under `/cars/compare` and `/bikes/compare`.
 * Defaults to cars; query string is preserved for bookmarks.
 */
export default async function LegacyCompareRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string; ids?: string }>;
}) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  if (typeof sp.model === "string" && sp.model.trim()) q.set("model", sp.model);
  if (typeof sp.ids === "string" && sp.ids.trim()) q.set("ids", sp.ids);
  const qs = q.toString();
  redirect(`/cars/compare${qs ? `?${qs}` : ""}`);
}
