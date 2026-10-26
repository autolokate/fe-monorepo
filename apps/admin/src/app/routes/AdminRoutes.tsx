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

const OwnershipClaimsPage = lazy(() =>
  import('@/features/ownership-claims/OwnershipClaimsPage').then((module) => ({
    default: module.OwnershipClaimsPage,
  })),
);

const UsersPage = lazy(() =>
  import('@/features/users/UsersPage').then((module) => ({
    default: module.UsersPage,
  })),
);

const GarageCommercialConfigPage = lazy(() =>
  import('@/features/garage/GarageCommercialConfigPage').then((module) => ({
    default: module.GarageCommercialConfigPage,
  })),
);

const TaxiPolicyPage = lazy(() =>
  import('@/features/taxi/TaxiPolicyPage').then((module) => ({
    default: module.TaxiPolicyPage,
  })),
);

const DiscoveryOverviewPage = lazy(() =>
  import('@/features/discovery/DiscoveryOverviewPage').then((module) => ({
    default: module.DiscoveryOverviewPage,
  })),
);

const DiscoveryQaPage = lazy(() =>
  import('@/features/discovery/DiscoveryQaPage').then((module) => ({
    default: module.DiscoveryQaPage,
  })),
);

const DiscoveryReelsPage = lazy(() =>
  import('@/features/discovery/DiscoveryReelsPage').then((module) => ({
    default: module.DiscoveryReelsPage,
  })),
);

const DiscoveryRepliesPage = lazy(() =>
  import('@/features/discovery/DiscoveryRepliesPage').then((module) => ({
    default: module.DiscoveryRepliesPage,
  })),
);
const DiscoveryAcademyPage = lazy(() =>
  import('@/features/discovery/DiscoveryAcademyPage').then((module) => ({
    default: module.DiscoveryAcademyPage,
  })),
);
const DiscoveryDailyDrivePage = lazy(() =>
  import('@/features/discovery/DiscoveryDailyDrivePage').then((module) => ({
    default: module.DiscoveryDailyDrivePage,
  })),
);

const PartnersDirectoryPage = lazy(() =>
  import('@/features/partners/PartnersDirectoryPage').then((module) => ({
    default: module.PartnersDirectoryPage,
  })),
);

const PartnerDetailPage = lazy(() =>
  import('@/features/partners/PartnerDetailPage').then((module) => ({
    default: module.PartnerDetailPage,
  })),
);

const PartnerRequestsInboxPage = lazy(() =>
  import('@/features/partners/PartnerRequestsInboxPage').then((module) => ({
    default: module.PartnerRequestsInboxPage,
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
            <Route path={adminPaths.garageCommercial} element={<GarageCommercialConfigPage />} />
            <Route path={adminPaths.taxiPolicy} element={<TaxiPolicyPage />} />
            <Route path={adminPaths.orders} element={<OrdersPage />} />
            <Route path={adminPaths.subscriptions} element={<SubscriptionsPage />} />
            <Route path={adminPaths.shipments} element={<ShipmentsPage />} />
            <Route path={adminPaths.payments} element={<PaymentsPage />} />
            <Route path={adminPaths.support} element={<SupportTicketsPage />} />
            <Route path={adminPaths.incidents} element={<IncidentsPage />} />
            <Route path={adminPaths.auditEvents} element={<AuditEventsPage />} />
            <Route path={adminPaths.finance} element={<FinanceOperationsPage />} />
            <Route path={adminPaths.ownershipTransfers} element={<OwnershipTransfersPage />} />
            <Route path={adminPaths.ownershipClaims} element={<OwnershipClaimsPage />} />
            <Route path={adminPaths.users} element={<UsersPage />} />
            <Route path={adminPaths.discovery} element={<DiscoveryOverviewPage />} />
            <Route path={adminPaths.discoveryQa} element={<DiscoveryQaPage />} />
            <Route path={adminPaths.discoveryReels} element={<DiscoveryReelsPage />} />
            <Route path={adminPaths.discoveryReplies} element={<DiscoveryRepliesPage />} />
            <Route path={adminPaths.discoveryDailyDrive} element={<DiscoveryDailyDrivePage />} />
            <Route path={adminPaths.discoveryAcademy} element={<DiscoveryAcademyPage />} />
            <Route path={adminPaths.partners} element={<PartnersDirectoryPage />} />
            <Route path={adminPaths.partnersRequests} element={<PartnerRequestsInboxPage />} />
            <Route path={`${adminPaths.partners}/:orgId`} element={<PartnerDetailPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={adminPaths.dashboard} replace />} />
      </Routes>
    </Suspense>
  );
}
