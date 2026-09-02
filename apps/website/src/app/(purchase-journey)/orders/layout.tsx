import type { ReactNode } from 'react';

/**
 * Orders shell with a `@modal` parallel slot. Soft navigations to
 * `/orders/[orderNo]/track` are intercepted (see `@modal/(.)[orderNo]/track`)
 * and rendered here as a dialog over the current page; a hard load of that URL
 * falls back to the standalone full-page track view.
 */
export default function OrdersLayout({
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
