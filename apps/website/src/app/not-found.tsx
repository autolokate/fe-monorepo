import { NotFoundContent, notFoundMetadata } from '@/app/page-not-found';

export const metadata = notFoundMetadata;

export default function NotFoundPage() {
  return <NotFoundContent />;
}
