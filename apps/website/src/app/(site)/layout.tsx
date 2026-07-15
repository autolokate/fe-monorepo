import { type ReactNode } from 'react';
import { Chrome } from '@/layouts';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <Chrome>{children}</Chrome>;
}
