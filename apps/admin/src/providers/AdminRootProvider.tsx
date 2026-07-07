import type { ReactNode } from 'react';

import { QueryProvider } from '@/providers/QueryProvider.js';
import { ThemeProvider } from '@/providers/ThemeProvider.js';

export function AdminRootProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
