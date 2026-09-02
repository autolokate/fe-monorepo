import { AddressBook } from './components/AddressBook';
import { addressesMetadata } from './config/metadata';

export const metadata = addressesMetadata;

export default function AddressesPage() {
  return <AddressBook />;
}
