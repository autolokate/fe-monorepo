import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SharePreview } from '@/components/share/SharePreview';
import { fetchPublicReel } from '@/lib/share/public-reel';
import { shareMetadata } from '@/lib/share/share-meta';

// Re-rendered at most every minute so the meta stays fresh (poster goes through a redirect route).
export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

/** `https://autolokate.com/c/{clipId}` — shared garage (partner) clip. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return shareMetadata('c', await fetchPublicReel(id), id);
}

export default async function GarageClipSharePage({ params }: Props) {
  const { id } = await params;
  const reel = await fetchPublicReel(id);
  if (!reel) notFound(); // unknown / unpublished → 404
  return <SharePreview reel={reel} />;
}
