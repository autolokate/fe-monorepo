import { TrackModal } from '../../../components/TrackModal';

type Props = { params: Promise<{ orderNo: string }> };

/**
 * Intercepted `/orders/[orderNo]/track` — shown as a dialog over the orders
 * list on soft navigation. A hard load falls through to the full-page view.
 */
export default async function TrackModalPage({ params }: Props) {
  const { orderNo } = await params;
  return <TrackModal orderNo={orderNo} />;
}
