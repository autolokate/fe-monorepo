import { OrderStatusView } from './components/OrderStatusView';
import { orderStatusMetadata } from './config/metadata';

export const metadata = orderStatusMetadata;

type Props = { params: Promise<{ orderNo: string }> };

export default async function OrderStatusPage({ params }: Props) {
  const { orderNo } = await params;
  return <OrderStatusView orderNo={orderNo} />;
}
