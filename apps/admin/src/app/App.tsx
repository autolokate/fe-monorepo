import { BrowserRouter } from 'react-router-dom';

import { AdminRoutes } from '@/app/routes/AdminRoutes.js';
import { ToastHost } from '@/platform/feedback/ToastHost.js';
import { AdminAuthProvider } from '@/providers/AdminAuthProvider.js';
import { AdminRootProvider } from '@/providers/AdminRootProvider.js';

export function App() {
  return (
    <BrowserRouter>
      <AdminRootProvider>
        <AdminAuthProvider>
          <AdminRoutes />
          <ToastHost />
        </AdminAuthProvider>
      </AdminRootProvider>
    </BrowserRouter>
  );
}
