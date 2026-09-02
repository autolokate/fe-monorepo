import { AddressFormContainer } from '../../components/AddressFormContainer';
import { editAddressMetadata } from './config/metadata';

export const metadata = editAddressMetadata;

type Props = { params: Promise<{ addressId: string }> };

/** Hard-load fallback for `/addresses/[id]/edit` (soft-nav shows the modal). */
export default async function EditAddressPage({ params }: Props) {
  const { addressId } = await params;
  return <AddressFormContainer mode="edit" addressId={addressId} variant="page" />;
}
