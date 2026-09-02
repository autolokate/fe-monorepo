import { AddressFormContainer } from '../../components/AddressFormContainer';

/** Intercepted `/addresses/new` — shown as a dialog over the address list. */
export default function NewAddressModal() {
  return <AddressFormContainer mode="create" variant="modal" />;
}
