import { OrderTrackView } from './components/OrderTrackView';
import { orderTrackMetadata } from './config/metadata';

export const metadata = orderTrackMetadata;

type Props = { params: Promise<{ orderNo: string }> };

export default async function OrderTrackPage({ params }: Props) {
  const { orderNo } = await params;
  return <OrderTrackView orderNo={orderNo} />;
}
