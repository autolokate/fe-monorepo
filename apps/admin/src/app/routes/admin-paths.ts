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
  garageCommercial: '/garage-commercial',
  taxiPolicy: '/taxi-policy',
  servicesCatalogue: '/services-catalogue',
  finance: '/finance',
  ownershipTransfers: '/ownership-transfers',
  ownershipClaims: '/ownership-claims',
  users: '/users',
  discovery: '/discovery',
  discoveryQa: '/discovery/qa',
  discoveryReplies: '/discovery/replies',
  discoveryReels: '/discovery/reels',
  discoveryDailyDrive: '/discovery/daily-drive',
  discoveryAcademy: '/discovery/academy',
  partners: '/partners',
  partnersRequests: '/partners/requests',
} as const;

export function adminInventoryBatchPath(batchId: string): string {
  return `${adminPaths.inventory}/${batchId}`;
}

export function adminQrBatchPath(batchId: string): string {
  return `${adminPaths.qrBatches}/${batchId}`;
}

export function adminPartnerPath(orgId: string): string {
  return `${adminPaths.partners}/${encodeURIComponent(orgId)}`;
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
  | 'partners'
  | 'discovery'
  | 'governance'
  | 'emergency';

/** The section headers, in display order. */
export const ADMIN_NAV_GROUPS: { id: AdminNavGroupId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'customer-care', label: 'Customer Care' },
  { id: 'finance', label: 'Finance' },
  { id: 'products', label: 'Products' },
  { id: 'partners', label: 'Partners' },
  { id: 'discovery', label: 'Discovery' },
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
    description: 'Support tickets are not available yet',
    group: 'customer-care',
    nav: false,
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
  {
    path: adminPaths.garageCommercial,
    label: 'Garage commercial',
    description: 'Pass pricing, free bids, and partner provisioning for Garage',
    group: 'products',
    nav: true,
  },
  {
    path: adminPaths.taxiPolicy,
    label: 'Taxi policy',
    description: 'Taxi advance and deposit policy',
    group: 'products',
    nav: true,
  },
  {
    path: adminPaths.servicesCatalogue,
    label: 'Services catalogue',
    description: 'Service providers for the consumer Services hub',
    group: 'products',
    nav: true,
  },

  // Partners — org directory + marketplace RFQ / bids inbox (Garage + Taxi).
  {
    path: adminPaths.partners,
    label: 'Partners',
    description: 'Partner org directory (Garage / Store / Taxi)',
    group: 'partners',
    nav: true,
  },
  {
    path: adminPaths.partnersRequests,
    label: 'Requests & bids',
    description: 'Garage and taxi request inbox with embedded bids',
    group: 'partners',
    nav: true,
  },

  // Discovery — editorial content the consumer app shows (Q&A + Reels). Plans and coverage live under Products / Customer Care.
  {
    path: adminPaths.discovery,
    label: 'Discovery',
    description: 'Discovery overview — Q&A, reels, plans and coverage at a glance',
    group: 'discovery',
    nav: true,
  },
  {
    path: adminPaths.discoveryQa,
    label: 'Q&A',
    description: 'Create, edit, publish and hide community Q&A',
    group: 'discovery',
    nav: true,
  },
  {
    path: adminPaths.discoveryReplies,
    label: 'Q&A replies',
    description: 'Moderate member replies under Q&A answers — hide or restore',
    group: 'discovery',
    nav: true,
  },
  {
    path: adminPaths.discoveryReels,
    label: 'Reels',
    description: 'Upload, publish and archive Discovery reels',
    group: 'discovery',
    nav: true,
  },
  {
    path: adminPaths.discoveryDailyDrive,
    label: 'Daily Drive',
    description: 'Free Daily Drive videos from the Indian Drive Guide YouTube channel',
    group: 'discovery',
    nav: true,
  },
  {
    path: adminPaths.discoveryAcademy,
    label: 'Academy',
    description: 'Courses of Indian Drive Guide lessons for members with an active plan',
    group: 'discovery',
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
    path: adminPaths.ownershipClaims,
    label: 'Ownership claims',
    description: 'Review customer ownership claims (RC proof + plan entitlement)',
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
