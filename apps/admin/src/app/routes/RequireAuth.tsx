import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AlScreenSpinner } from '@autolokate/ui';

import { useAdminAuth } from '@/providers/AdminAuthProvider.js';
import { adminPaths } from '@/app/routes/admin-paths.js';

export function RequireAuth() {
  const { isAuthenticated, isBootstrapping } = useAdminAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <AlScreenSpinner aria-label="Restoring admin session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={adminPaths.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
