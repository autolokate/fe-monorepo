import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { RequireAuth } from '@/app/routes/RequireAuth';
import { AdminShellLayout } from '@/layouts/AdminShellLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';

const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);

const QrInventoryPage = lazy(() =>
  import('@/features/inventory/QrInventoryPage').then((module) => ({
    default: module.QrInventoryPage,
  })),
);

const QrBatchManagementPage = lazy(() =>
  import('@/features/qr-batches/QrBatchManagementPage').then((module) => ({
    default: module.QrBatchManagementPage,
  })),
);

const BatchManagementDetailPage = lazy(() =>
  import('@/features/qr-batches/BatchManagementDetailPage').then((module) => ({
    default: module.BatchManagementDetailPage,
  })),
);
const CatalogPage = lazy(() =>
  import('@/features/catalog/CatalogPage').then((module) => ({
    default: module.CatalogPage,
  })),
);

const PromoManagementPage = lazy(() =>
  import('@/features/promos/PromoManagementPage').then((module) => ({
    default: module.PromoManagementPage,
  })),
);

const OrdersPage = lazy(() =>
  import('@/features/orders/OrdersPage').then((module) => ({
    default: module.OrdersPage,
  })),
);

const SubscriptionsPage = lazy(() =>
  import('@/features/subscriptions/SubscriptionsPage').then((module) => ({
    default: module.SubscriptionsPage,
  })),
);

const ShipmentsPage = lazy(() =>
  import('@/features/shipments/ShipmentsPage').then((module) => ({
    default: module.ShipmentsPage,
  })),
);

const PaymentsPage = lazy(() =>
  import('@/features/payments/PaymentsPage').then((module) => ({
    default: module.PaymentsPage,
  })),
);

const SupportTicketsPage = lazy(() =>
  import('@/features/support/SupportTicketsPage').then((module) => ({
    default: module.SupportTicketsPage,
  })),
);

const IncidentsPage = lazy(() =>
  import('@/features/incidents/IncidentsPage').then((module) => ({
    default: module.IncidentsPage,
  })),
);

const AuditEventsPage = lazy(() =>
  import('@/features/audit/AuditEventsPage').then((module) => ({
    default: module.AuditEventsPage,
  })),
);

const FinanceOperationsPage = lazy(() =>
  import('@/features/finance/FinanceOperationsPage').then((module) => ({
    default: module.FinanceOperationsPage,
  })),
);

const OwnershipTransfersPage = lazy(() =>
  import('@/features/ownership-transfers/OwnershipTransfersPage').then((module) => ({
    default: module.OwnershipTransfersPage,
  })),
);

const UsersPage = lazy(() =>
  import('@/features/users/UsersPage').then((module) => ({
    default: module.UsersPage,
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
            <Route
              path={adminPaths.root}
              element={<Navigate to={adminPaths.dashboard} replace />}
            />
            <Route path={adminPaths.dashboard} element={<DashboardPage />} />
            <Route path={adminPaths.inventory} element={<QrInventoryPage />} />
            <Route
              path={`${adminPaths.inventory}/:batchId`}
              element={<BatchManagementDetailPage />}
            />
            <Route path={adminPaths.qrBatches} element={<QrBatchManagementPage />} />
            <Route
              path={`${adminPaths.qrBatches}/:batchId`}
              element={<BatchManagementDetailPage />}
            />
            <Route path={adminPaths.catalog} element={<CatalogPage />} />
            <Route path={adminPaths.promos} element={<PromoManagementPage />} />
            <Route path={adminPaths.orders} element={<OrdersPage />} />
            <Route path={adminPaths.subscriptions} element={<SubscriptionsPage />} />
            <Route path={adminPaths.shipments} element={<ShipmentsPage />} />
            <Route path={adminPaths.payments} element={<PaymentsPage />} />
            <Route path={adminPaths.support} element={<SupportTicketsPage />} />
            <Route path={adminPaths.incidents} element={<IncidentsPage />} />
            <Route path={adminPaths.auditEvents} element={<AuditEventsPage />} />
            <Route path={adminPaths.finance} element={<FinanceOperationsPage />} />
            <Route path={adminPaths.ownershipTransfers} element={<OwnershipTransfersPage />} />
            <Route path={adminPaths.users} element={<UsersPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={adminPaths.dashboard} replace />} />
      </Routes>
    </Suspense>
  );
}
