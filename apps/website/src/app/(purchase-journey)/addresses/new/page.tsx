import { AddressFormContainer } from '../components/AddressFormContainer';
import { newAddressMetadata } from './config/metadata';

export const metadata = newAddressMetadata;

/** Hard-load fallback for `/addresses/new` (soft-nav shows the intercepted modal). */
export default function NewAddressPage() {
  return <AddressFormContainer mode="create" variant="page" />;
}
