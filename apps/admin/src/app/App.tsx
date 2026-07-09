import { BrowserRouter } from 'react-router-dom';

import { AdminRoutes } from '@/app/routes/AdminRoutes';
import { ToastHost } from '@/platform/feedback/ToastHost';
import { AdminAuthProvider } from '@/providers/AdminAuthProvider';
import { AdminRootProvider } from '@/providers/AdminRootProvider';

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
