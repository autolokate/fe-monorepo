import { AddressFormContainer } from '../../../components/AddressFormContainer';

type Props = { params: Promise<{ addressId: string }> };

/** Intercepted `/addresses/[id]/edit` — shown as a dialog over the address list. */
export default async function EditAddressModal({ params }: Props) {
  const { addressId } = await params;
  return <AddressFormContainer mode="edit" addressId={addressId} variant="modal" />;
}
