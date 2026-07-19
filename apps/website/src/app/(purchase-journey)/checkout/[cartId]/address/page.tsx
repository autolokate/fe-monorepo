import { AddressView } from './components/AddressView';
import { addressMetadata } from './config/metadata';

export const metadata = addressMetadata;

type Props = { params: Promise<{ cartId: string }> };

export default async function AddressPage({ params }: Props) {
  const { cartId } = await params;
  return <AddressView cartId={cartId} />;
}
