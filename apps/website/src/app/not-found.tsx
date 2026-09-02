import { NotFoundContent, notFoundMetadata } from './(site)/404';
import { Chrome } from '@/layouts';

export const metadata = notFoundMetadata;

export default function NotFoundPage() {
  return (
    <Chrome>
      <NotFoundContent />
    </Chrome>
  );
}
