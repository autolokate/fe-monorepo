import type { ReactNode } from 'react';

/**
 * Addresses shell with a `@modal` parallel slot. Soft navigations to
 * `/addresses/new` and `/addresses/[id]/edit` are intercepted (see
 * `@modal/(.)new` and `@modal/(.)[addressId]/edit`) and rendered here as a
 * dialog over the list; a hard load of those URLs falls back to the standalone
 * full-page form.
 */
export default function AddressesLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
