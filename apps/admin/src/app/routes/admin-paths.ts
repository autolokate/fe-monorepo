export const adminPaths = {
  root: '/',
  login: '/login',
  dashboard: '/dashboard',
  inventory: '/inventory',
  qrBatches: '/qr-batches',
  catalog: '/catalog',
  promos: '/promos',
  orders: '/orders',
  subscriptions: '/subscriptions',
  auditEvents: '/audit-events',
  finance: '/finance',
  ownershipTransfers: '/ownership-transfers',
  users: '/users',
} as const;

export function adminInventoryBatchPath(batchId: string): string {
  return `${adminPaths.inventory}/${batchId}`;
}

export function adminQrBatchPath(batchId: string): string {
  return `${adminPaths.qrBatches}/${batchId}`;
}

export type AdminRouteMeta = {
  path: string;
  label: string;
  description?: string;
  nav?: boolean;
};

export const adminRoutes: AdminRouteMeta[] = [
  {
    path: adminPaths.dashboard,
    label: 'Dashboard',
    description: 'Operational overview',
    nav: true,
  },
  {
    path: adminPaths.inventory,
    label: 'QR Inventory',
    description: 'QR batch inventory summaries',
    nav: true,
  },
  {
    path: adminPaths.qrBatches,
    label: 'QR Batch Management',
    description: 'Create and manage QR batches',
    nav: true,
  },
  {
    path: adminPaths.catalog,
    label: 'Catalog',
    description: 'Plan versions and the SKU shelves that sell them',
    nav: true,
  },
  {
    path: adminPaths.promos,
    label: 'Promo Management',
    description: 'Create and manage promotional campaigns',
    nav: true,
  },
  {
    path: adminPaths.orders,
    label: 'Orders',
    description: 'Customer orders',
    nav: true,
  },
  {
    path: adminPaths.subscriptions,
    label: 'Subscriptions',
    description: 'Customer subscriptions',
    nav: true,
  },
  {
    path: adminPaths.auditEvents,
    label: 'Audit Events',
    description: 'Administrative activity timeline',
    nav: true,
  },
  {
    path: adminPaths.finance,
    label: 'Finance Operations',
    description: 'Clawbacks and settlement batch mutations',
    nav: true,
  },
  {
    path: adminPaths.ownershipTransfers,
    label: 'Ownership Transfers',
    description: 'Initiate and approve ownership transfers',
    nav: true,
  },
  {
    path: adminPaths.users,
    label: 'Users & Roles',
    description: 'Grant and revoke the ADMIN role',
    nav: true,
  },
];

export const adminNavRoutes = adminRoutes.filter((route) => route.nav);
