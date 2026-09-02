import { ReviewView } from './components/ReviewView';
import { reviewMetadata } from './config/metadata';

export const metadata = reviewMetadata;

type Props = { params: Promise<{ cartId: string }> };

export default async function ReviewPage({ params }: Props) {
  const { cartId } = await params;
  return <ReviewView cartId={cartId} />;
}
