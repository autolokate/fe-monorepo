/** API route definitions — single source of truth for backend paths. */
export const endpoints = {
  auth: {
    requestOtp: '/v1/auth/otp/request',
    verifyOtp: '/v1/auth/otp/verify',
    refresh: '/v1/auth/refresh',
    logout: '/v1/auth/logout',
    session: '/v1/auth/session',
    profile: '/v1/profile',
  },
  consents: {
    list: '/v1/me/consents',
    grant: '/v1/me/consents',
  },
  legal: {
    documents: '/v1/legal/documents',
  },
  devices: {
    token: '/v1/devices/token',
  },
  qr: {
    resolve: (code: string) => `/v1/qr/${encodeURIComponent(code)}/resolve`,
    attach: (code: string) => `/v1/qr/${encodeURIComponent(code)}/attach`,
  },
  vehicles: {
    lookup: '/v1/vehicles/lookup',
    list: '/v1/vehicles',
    detail: (vehicleId: string) => `/v1/vehicles/${vehicleId}`,
    create: '/vehicles',
  },
  plans: {
    list: '/v1/plans',
    detail: (planId: string) => `/plans/${planId}`,
  },
  orders: {
    create: '/v1/orders',
    pay: (orderId: string) => `/v1/orders/${orderId}/pay`,
    payment: (orderId: string) => `/v1/orders/${orderId}/payment`,
  },
  promos: {
    validate: '/v1/promos/validate',
  },
  activation: {
    preview: (code: string) =>
      `/v1/activation/preview?code=${encodeURIComponent(code)}`,
    redeem: '/v1/activation/redeem',
  },
  emergencyContacts: {
    list: '/v1/emergency-contacts',
    otpRequest: '/v1/emergency-contacts/otp/request',
    otpVerify: '/v1/emergency-contacts/otp/verify',
    create: '/v1/emergency-contacts',
    delete: (contactId: string) =>
      `/v1/emergency-contacts/${encodeURIComponent(contactId)}`,
  },
  riders: {
    list: (subscriptionId: string) =>
      `/v1/subscriptions/${encodeURIComponent(subscriptionId)}/riders`,
    otpRequest: '/v1/riders/otp/request',
    otpVerify: '/v1/riders/otp/verify',
    create: '/v1/riders',
    delete: (riderId: string) => `/v1/riders/${encodeURIComponent(riderId)}`,
  },
  scanner: {
    parkOtpRequest: (code: string) =>
      `/v1/qr/${encodeURIComponent(code)}/park/otp/request`,
    parkOtpVerify: (code: string) =>
      `/v1/qr/${encodeURIComponent(code)}/park/otp/verify`,
    parkVehicleLookup: (code: string) =>
      `/v1/qr/${encodeURIComponent(code)}/park/vehicles/lookup`,
    parkMedia: (code: string) => `/v1/qr/${encodeURIComponent(code)}/park/media`,
    parkMediaComplete: (code: string, mediaId: string) =>
      `/v1/qr/${encodeURIComponent(code)}/park/media/${encodeURIComponent(mediaId)}/complete`,
    parkOpen: (code: string) => `/v1/qr/${encodeURIComponent(code)}/park`,
    parkStatus: (notificationId: string) =>
      `/v1/park/${encodeURIComponent(notificationId)}`,
    emergencyMedia: (code: string) =>
      `/v1/qr/${encodeURIComponent(code)}/emergency/media`,
    emergencyMediaComplete: (code: string, mediaId: string) =>
      `/v1/qr/${encodeURIComponent(code)}/emergency/media/${encodeURIComponent(mediaId)}/complete`,
    emergencyOpen: (code: string) => `/v1/qr/${encodeURIComponent(code)}/emergency`,
    emergencyStatus: (alertId: string) =>
      `/v1/emergency/${encodeURIComponent(alertId)}`,
    emergencyCancel: (alertId: string) =>
      `/v1/emergency/${encodeURIComponent(alertId)}/cancel`,
  },
  admin: {
    auditEvents: '/admin/v1/audit-events',
    clawbacks: '/admin/v1/clawbacks',
    inventory: '/admin/v1/inventory',
    ownershipTransfers: '/admin/v1/ownership-transfers',
    approveOwnershipTransfer: (id: string) =>
      `/admin/v1/ownership-transfers/${encodeURIComponent(id)}/approve`,
    fulfilPartnerReorder: (id: string) =>
      `/admin/v1/partner-reorders/${encodeURIComponent(id)}/fulfil`,
    promos: '/admin/v1/promos',
    qrAutoDetachSweep: '/admin/v1/qr-auto-detach-sweep',
    qrBatches: '/admin/v1/qr-batches',
    generateQrBatch: (id: string) =>
      `/admin/v1/qr-batches/${encodeURIComponent(id)}/generate`,
    provisionQrBatch: (id: string) =>
      `/admin/v1/qr-batches/${encodeURIComponent(id)}/provision`,
    qrBatchCodes: (id: string) =>
      `/admin/v1/qr-batches/${encodeURIComponent(id)}/codes`,
    exportQrBatchCodes: (id: string) =>
      `/admin/v1/qr-batches/${encodeURIComponent(id)}/codes/export`,
    skus: '/admin/v1/skus',
    replaceQr: (code: string) => `/admin/v1/qr/${encodeURIComponent(code)}/replace`,
    retireQr: (code: string) => `/admin/v1/qr/${encodeURIComponent(code)}/retire`,
    settlementBatch: '/admin/v1/settlement-batch',
    users: '/admin/v1/users',
    userRoles: (userId: string) => `/admin/v1/users/${encodeURIComponent(userId)}/roles`,
    userRole: (userId: string, role: string) =>
      `/admin/v1/users/${encodeURIComponent(userId)}/roles/${encodeURIComponent(role)}`,
  },
} as const;

export type EndpointGroup = keyof typeof endpoints;
