import { OrdersView } from './components/OrdersView';
import { ordersMetadata } from './config/metadata';

export const metadata = ordersMetadata;

export default function OrdersPage() {
  return <OrdersView />;
}
