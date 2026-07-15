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
  shipments: '/shipments',
  payments: '/payments',
  support: '/support',
  incidents: '/incidents',
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

/**
 * Sidebar sections, grouped by the JOB a person is doing rather than the table behind it, and ordered
 * so the highest-frequency daily work sits at the top. One customer's whole world (their orders,
 * coverage, deliveries, payments and tickets) lives together under Customer Care; rare governance sinks
 * to the bottom; the break-glass emergency view is isolated in its own slot so it is only opened on purpose.
 */
export type AdminNavGroupId =
  | 'overview'
  | 'customer-care'
  | 'finance'
  | 'products'
  | 'governance'
  | 'emergency';

/** The section headers, in display order. */
export const ADMIN_NAV_GROUPS: { id: AdminNavGroupId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'customer-care', label: 'Customer Care' },
  { id: 'finance', label: 'Finance' },
  { id: 'products', label: 'Products' },
  { id: 'governance', label: 'Governance' },
  { id: 'emergency', label: 'Emergency' },
];

export type AdminRouteMeta = {
  path: string;
  label: string;
  description?: string;
  group: AdminNavGroupId;
  nav?: boolean;
};

/** Every admin route, in sidebar display order (group, then within-group order). */
export const adminRoutes: AdminRouteMeta[] = [
  // Overview — the shared shift-start pulse.
  {
    path: adminPaths.dashboard,
    label: 'Dashboard',
    description: 'Operational overview',
    group: 'overview',
    nav: true,
  },

  // Customer Care — one customer's whole world, in daily-frequency order.
  {
    path: adminPaths.users,
    label: 'Customers',
    description: 'Find a customer by phone — their orders, coverage and account access',
    group: 'customer-care',
    nav: true,
  },
  {
    path: adminPaths.support,
    label: 'Tickets',
    description: 'Support tickets and status triage',
    group: 'customer-care',
    nav: true,
  },
  {
    path: adminPaths.orders,
    label: 'Orders',
    description: 'Customer orders',
    group: 'customer-care',
    nav: true,
  },
  {
    path: adminPaths.subscriptions,
    label: 'Coverage',
    description: 'Active protection per vehicle',
    group: 'customer-care',
    nav: true,
  },
  {
    path: adminPaths.shipments,
    label: 'Deliveries',
    description: 'Shipment tracking and delivery status',
    group: 'customer-care',
    nav: true,
  },
  {
    path: adminPaths.payments,
    label: 'Payments',
    description: 'Payment attempts, settled outcome and refunds',
    group: 'customer-care',
    nav: true,
  },

  // Finance — the money back office.
  {
    path: adminPaths.finance,
    label: 'Settlements',
    description: 'Clawbacks and settlement batches',
    group: 'finance',
    nav: true,
  },
  {
    path: adminPaths.promos,
    label: 'Promos',
    description: 'Promotional campaigns and discount codes',
    group: 'finance',
    nav: true,
  },

  // Products — what we sell and the physical stickers that carry it.
  {
    path: adminPaths.catalog,
    label: 'Catalog',
    description: 'Plan versions and the SKU shelves that sell them',
    group: 'products',
    nav: true,
  },
  {
    path: adminPaths.inventory,
    label: 'Stock',
    description: 'QR sticker stock by batch',
    group: 'products',
    nav: true,
  },
  {
    path: adminPaths.qrBatches,
    label: 'Batches',
    description: 'Create and manage QR sticker batches',
    group: 'products',
    nav: true,
  },

  // Governance — infrequent, high-trust, fully-audited admin work.
  {
    path: adminPaths.ownershipTransfers,
    label: 'Ownership',
    description: 'Initiate and approve vehicle ownership transfers',
    group: 'governance',
    nav: true,
  },
  {
    path: adminPaths.auditEvents,
    label: 'Activity Log',
    description: 'Administrative activity timeline',
    group: 'governance',
    nav: true,
  },

  // Emergency — break-glass only, isolated so it is never opened by habit.
  {
    path: adminPaths.incidents,
    label: 'Incidents',
    description: 'Break-glass emergency-incident view (every read audited)',
    group: 'emergency',
    nav: true,
  },
];

export const adminNavRoutes = adminRoutes.filter((route) => route.nav);

export type AdminNavSection = {
  id: AdminNavGroupId;
  label: string;
  items: AdminRouteMeta[];
};

/**
 * The nav grouped into ordered sections — the single source the sidebar AND the command palette both
 * render from, so the two never drift apart. Empty groups are dropped.
 */
export function adminNavSections(): AdminNavSection[] {
  return ADMIN_NAV_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    items: adminNavRoutes.filter((route) => route.group === group.id),
  })).filter((section) => section.items.length > 0);
}
