import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths.js';
import { RequireAuth } from '@/app/routes/RequireAuth.js';
import { AdminShellLayout } from '@/layouts/AdminShellLayout.js';
import { LoginPage } from '@/features/auth/LoginPage.js';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader.js';

const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage.js').then((module) => ({
    default: module.DashboardPage,
  })),
);

const QrInventoryPage = lazy(() =>
  import('@/features/inventory/QrInventoryPage.js').then((module) => ({
    default: module.QrInventoryPage,
  })),
);

const QrBatchManagementPage = lazy(() =>
  import('@/features/qr-batches/QrBatchManagementPage.js').then((module) => ({
    default: module.QrBatchManagementPage,
  })),
);

const PromoManagementPage = lazy(() =>
  import('@/features/promos/PromoManagementPage.js').then((module) => ({
    default: module.PromoManagementPage,
  })),
);

const AuditEventsPage = lazy(() =>
  import('@/features/audit/AuditEventsPage.js').then((module) => ({
    default: module.AuditEventsPage,
  })),
);

const FinanceOperationsPage = lazy(() =>
  import('@/features/finance/FinanceOperationsPage.js').then((module) => ({
    default: module.FinanceOperationsPage,
  })),
);

const OwnershipTransfersPage = lazy(() =>
  import('@/features/ownership-transfers/OwnershipTransfersPage.js').then((module) => ({
    default: module.OwnershipTransfersPage,
  })),
);

function LazyFallback() {
  return <AdminPageLoader fullscreen label="Loading admin page…" />;
}

export function AdminRoutes() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Routes>
        <Route path={adminPaths.login} element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AdminShellLayout />}>
            <Route path={adminPaths.root} element={<Navigate to={adminPaths.dashboard} replace />} />
            <Route path={adminPaths.dashboard} element={<DashboardPage />} />
            <Route path={adminPaths.inventory} element={<QrInventoryPage />} />
            <Route path={adminPaths.qrBatches} element={<QrBatchManagementPage />} />
            <Route path={adminPaths.promos} element={<PromoManagementPage />} />
            <Route path={adminPaths.auditEvents} element={<AuditEventsPage />} />
            <Route path={adminPaths.finance} element={<FinanceOperationsPage />} />
            <Route path={adminPaths.ownershipTransfers} element={<OwnershipTransfersPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={adminPaths.dashboard} replace />} />
      </Routes>
    </Suspense>
  );
}
