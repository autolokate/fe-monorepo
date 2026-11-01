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
  garageTaxonomy: '/garage-taxonomy',
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
  partnersKyc: '/partners/kyc',
  taxiBookings: '/taxi/bookings',
  taxiEnrollments: '/taxi/partners',
  experts: '/experts',
} as const;

export function adminTaxiBookingPath(bookingId: string): string {
  return `${adminPaths.taxiBookings}/${encodeURIComponent(bookingId)}`;
}

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
 * Sidebar sections — one per operational domain, in the order a shift works through them:
 * day-to-day operations first, then each partner marketplace, then catalogue/content authoring,
 * then safety, money, people, and the audit trail.
 */
export type AdminNavGroupId =
  | 'operations'
  | 'partners'
  | 'taxi'
  | 'garage'
  | 'catalog'
  | 'content'
  | 'safety'
  | 'finance'
  | 'users'
  | 'audit';

/** The section headers, in display order. */
export const ADMIN_NAV_GROUPS: { id: AdminNavGroupId; label: string }[] = [
  { id: 'operations', label: 'Operations' },
  { id: 'partners', label: 'Partners' },
  { id: 'taxi', label: 'Taxi' },
  { id: 'garage', label: 'Garage' },
  { id: 'catalog', label: 'Catalog & Plans' },
  { id: 'content', label: 'Content' },
  { id: 'safety', label: 'Safety' },
  { id: 'finance', label: 'Finance' },
  { id: 'users', label: 'Users' },
  { id: 'audit', label: 'Audit' },
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
  // Operations — the daily customer-facing queue.
  {
    path: adminPaths.dashboard,
    label: 'Dashboard',
    description: 'Operational overview',
    group: 'operations',
    nav: true,
  },
  {
    path: adminPaths.orders,
    label: 'Orders',
    description: 'Customer plan and QR orders',
    group: 'operations',
    nav: true,
  },
  {
    path: adminPaths.subscriptions,
    label: 'Coverage',
    description: 'Active protection per vehicle',
    group: 'operations',
    nav: true,
  },
  {
    path: adminPaths.shipments,
    label: 'Deliveries',
    description: 'Shipment tracking and delivery status',
    group: 'operations',
    nav: true,
  },
  {
    path: adminPaths.ownershipTransfers,
    label: 'Ownership transfers',
    description: 'Initiate and approve vehicle ownership transfers',
    group: 'operations',
    nav: true,
  },
  {
    path: adminPaths.ownershipClaims,
    label: 'Ownership claims',
    description: 'Review customer ownership claims (RC proof + plan entitlement)',
    group: 'operations',
    nav: true,
  },
  {
    path: adminPaths.support,
    label: 'Tickets',
    description: 'Support tickets are not available yet',
    group: 'operations',
    nav: false,
  },

  // Partners — org directory, KYC review, marketplace inbox.
  {
    path: adminPaths.partners,
    label: 'Directory',
    description: 'Partner org directory (Garage / Store / Taxi)',
    group: 'partners',
    nav: true,
  },
  {
    path: adminPaths.partnersKyc,
    label: 'KYC review',
    description: 'GST verification queue and decisions',
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

  // Taxi — bookings money flow, partner enrollments, policy.
  {
    path: adminPaths.taxiBookings,
    label: 'Bookings',
    description: 'Taxi bookings, advance/deposit state, cancel and deposit release',
    group: 'taxi',
    nav: true,
  },
  {
    path: adminPaths.taxiEnrollments,
    label: 'Taxi partners',
    description: 'Taxi enrollments — provision, suspend, reinstate',
    group: 'taxi',
    nav: true,
  },
  {
    path: adminPaths.taxiPolicy,
    label: 'Taxi policy',
    description: 'Advance, deposit, no-show and cancellation policy',
    group: 'taxi',
    nav: true,
  },

  // Garage — marketplace commercials and taxonomy.
  {
    path: adminPaths.garageCommercial,
    label: 'Commercial',
    description: 'Pass pricing, free bids, and partner provisioning for Garage',
    group: 'garage',
    nav: true,
  },
  {
    path: adminPaths.garageTaxonomy,
    label: 'Taxonomy',
    description: 'Workshops vehicle categories, categories, and subcategories',
    group: 'garage',
    nav: true,
  },

  // Catalog & Plans — what we sell, the stickers that carry it, and the services hub.
  {
    path: adminPaths.catalog,
    label: 'Plans & SKUs',
    description: 'Plan versions and the SKU shelves that sell them',
    group: 'catalog',
    nav: true,
  },
  {
    path: adminPaths.promos,
    label: 'Promos',
    description: 'Promotional campaigns and discount codes',
    group: 'catalog',
    nav: true,
  },
  {
    path: adminPaths.inventory,
    label: 'QR stock',
    description: 'QR sticker stock by batch',
    group: 'catalog',
    nav: true,
  },
  {
    path: adminPaths.qrBatches,
    label: 'QR batches',
    description: 'Create and manage QR sticker batches',
    group: 'catalog',
    nav: true,
  },
  {
    path: adminPaths.servicesCatalogue,
    label: 'Services hub',
    description: 'Service providers for the consumer Services hub',
    group: 'catalog',
    nav: true,
  },

  // Content — editorial surfaces the consumer app shows.
  {
    path: adminPaths.discovery,
    label: 'Discovery overview',
    description: 'Discovery overview — Q&A, reels, plans and coverage at a glance',
    group: 'content',
    nav: true,
  },
  {
    path: adminPaths.discoveryQa,
    label: 'Q&A',
    description: 'Create, edit, publish and hide community Q&A',
    group: 'content',
    nav: true,
  },
  {
    path: adminPaths.discoveryReplies,
    label: 'Q&A replies',
    description: 'Moderate member replies under Q&A answers — hide or restore',
    group: 'content',
    nav: true,
  },
  {
    path: adminPaths.discoveryReels,
    label: 'Reels',
    description: 'Upload, publish and archive Discovery reels',
    group: 'content',
    nav: true,
  },
  {
    path: adminPaths.discoveryDailyDrive,
    label: 'Daily Drive',
    description: 'Free Daily Drive videos from the Indian Drive Guide YouTube channel',
    group: 'content',
    nav: true,
  },
  {
    path: adminPaths.discoveryAcademy,
    label: 'Academy',
    description: 'Courses of Indian Drive Guide lessons for members with an active plan',
    group: 'content',
    nav: true,
  },
  {
    path: adminPaths.experts,
    label: 'Experts',
    description: 'Expert profiles, session types, slots and booking confirmation',
    group: 'content',
    nav: true,
  },

  // Safety — break-glass emergency view, isolated so it is opened on purpose.
  {
    path: adminPaths.incidents,
    label: 'Incidents',
    description: 'Break-glass emergency-incident view (every read audited)',
    group: 'safety',
    nav: true,
  },

  // Finance — payments and the money back office.
  {
    path: adminPaths.payments,
    label: 'Payments',
    description: 'Payment attempts, settled outcome and refunds',
    group: 'finance',
    nav: true,
  },
  {
    path: adminPaths.finance,
    label: 'Settlements',
    description: 'Clawbacks and settlement batches',
    group: 'finance',
    nav: true,
  },

  // Users — find a customer and their whole account.
  {
    path: adminPaths.users,
    label: 'Customers',
    description: 'Find a customer by phone — their orders, coverage and account access',
    group: 'users',
    nav: true,
  },

  // Audit — the administrative activity timeline.
  {
    path: adminPaths.auditEvents,
    label: 'Activity log',
    description: 'Administrative activity timeline',
    group: 'audit',
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
