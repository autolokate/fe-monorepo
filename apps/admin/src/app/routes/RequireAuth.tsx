import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths.js';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader.js';
import { useAdminAuth } from '@/providers/AdminAuthProvider.js';

export function RequireAuth() {
  const { isAuthenticated, isBootstrapping } = useAdminAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <AdminPageLoader fullscreen label="Restoring admin session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={adminPaths.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
