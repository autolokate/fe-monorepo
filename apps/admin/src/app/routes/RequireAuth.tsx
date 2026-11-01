import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { AccessDeniedPage } from '@/features/auth/AccessDeniedPage';
import { StepUpGate } from '@/features/auth/StepUpGate';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import { useAdminAuth } from '@/providers/AdminAuthProvider';

/**
 * Three gates, in the order the server enforces them on `/admin/v1/*`:
 * signed in → active role OPERATOR → `step_up` claim present.
 */
export function RequireAuth() {
  const { isAuthenticated, isBootstrapping, hasAdminPlaneRole, stepUpRequired } = useAdminAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <AdminPageLoader fullscreen label="Restoring admin session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={adminPaths.login} replace state={{ from: location.pathname }} />;
  }

  if (!hasAdminPlaneRole) {
    return <AccessDeniedPage />;
  }

  if (stepUpRequired) {
    return <StepUpGate />;
  }

  return <Outlet />;
}
