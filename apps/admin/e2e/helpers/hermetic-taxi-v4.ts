/** Synthetic fixtures for admin v4 taxi / garage / quotes screens — never real rows. */

export const HERMETIC_IMAGE_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"><rect width="40" height="30" fill="#7aa2ff"/></svg>',
  );

export const HERMETIC_FLEET_VEHICLE_ID = 'aaaaaaaa-0000-4000-8000-0000000000f1';
export const HERMETIC_FLEET_VEHICLE_ID_2 = 'aaaaaaaa-0000-4000-8000-0000000000f2';
export const HERMETIC_FLEET_ORG_ID = 'aaaaaaaa-0000-4000-8000-0000000000f3';
export const HERMETIC_FLEET_MEDIA_FRONT = 'aaaaaaaa-0000-4000-8000-0000000000f4';
export const HERMETIC_FLEET_MEDIA_VIDEO = 'aaaaaaaa-0000-4000-8000-0000000000f5';
export const HERMETIC_REFUND_ID = 'aaaaaaaa-0000-4000-8000-0000000000e1';
export const HERMETIC_REFUND_BOOKING_ID = 'aaaaaaaa-0000-4000-8000-0000000000e2';
export const HERMETIC_GARAGE_V4_ORG_ID = 'aaaaaaaa-0000-4000-8000-0000000000aa';
export const HERMETIC_GARAGE_PHOTO_ID = 'aaaaaaaa-0000-4000-8000-0000000000d1';
export const HERMETIC_CLIP_ID = 'aaaaaaaa-0000-4000-8000-0000000000d2';

const NOW = '2026-11-03T09:00:00.000Z';
const LATER = '2026-11-10T09:00:00.000Z';

const SLOTS = ['FRONT', 'REAR', 'SIDE', 'INTERIOR', 'VIDEO'] as const;

export function hermeticFleetCard(overrides: Record<string, unknown> = {}) {
  return {
    id: HERMETIC_FLEET_VEHICLE_ID,
    orgId: HERMETIC_FLEET_ORG_ID,
    orgName: 'Hermetic Cabs',
    registration: 'KA01HM0001',
    status: 'ACTIVE',
    label: null,
    createdAt: NOW,
    updatedAt: NOW,
    vehicleId: 'aaaaaaaa-0000-4000-8000-0000000000f6',
    make: 'Maruti',
    model: 'Dzire',
    color: 'White',
    role: 'OWNER',
    rcStatus: 'APPROVED',
    rejectionReason: null,
    media: {
      status: 'CURRENT',
      expiresAt: LATER,
      missingSlots: [],
      expiredSlots: [],
      current: true,
      slots: SLOTS.map((slot) => ({
        slot,
        status: 'CURRENT',
        mediaId:
          slot === 'FRONT'
            ? HERMETIC_FLEET_MEDIA_FRONT
            : slot === 'VIDEO'
              ? HERMETIC_FLEET_MEDIA_VIDEO
              : `aaaaaaaa-0000-4000-8000-00000000${slot === 'REAR' ? '0a01' : slot === 'SIDE' ? '0a02' : '0a03'}`,
        mediaAssetId: null,
        capturedAt: NOW,
        expiresAt: LATER,
      })),
    },
    assignedDriver: {
      assignmentId: 'aaaaaaaa-0000-4000-8000-0000000000f7',
      accountId: 'aaaaaaaa-0000-4000-8000-0000000000f8',
      username: 'hermetic.driver',
      phoneLast4: '4321',
    },
    driver: {
      source: 'ASSIGNED',
      accountId: 'aaaaaaaa-0000-4000-8000-0000000000f8',
      displayName: 'Hermetic Driver',
      photo: {
        status: 'CURRENT',
        capturedAt: NOW,
        expiresAt: LATER,
        url: null,
        urlExpiresInSeconds: null,
      },
    },
    canBid: true,
    bidBlockers: [],
    ...overrides,
  };
}

export function hermeticBlockedFleetCard() {
  return hermeticFleetCard({
    id: HERMETIC_FLEET_VEHICLE_ID_2,
    registration: 'KA01HM0002',
    make: 'Toyota',
    model: 'Innova',
    rcStatus: 'IN_REVIEW',
    canBid: false,
    bidBlockers: ['RC_NOT_APPROVED', 'MEDIA_EXPIRED'],
    driver: null,
    assignedDriver: null,
  });
}

export function hermeticFleetDetail(options: { frontRemoved?: boolean } = {}) {
  const card = hermeticFleetCard();
  const photoUrl = (slot: string) => `${HERMETIC_IMAGE_DATA_URL}#${slot}`;
  const items = [
    {
      mediaId: HERMETIC_FLEET_MEDIA_FRONT,
      slot: 'FRONT',
      kind: 'PHOTO',
      capturedAt: NOW,
      expiresAt: LATER,
      durationSeconds: null,
      url: photoUrl('front'),
      urlExpiresInSeconds: 300,
      contentType: 'image/svg+xml',
    },
    {
      mediaId: 'aaaaaaaa-0000-4000-8000-000000000a01',
      slot: 'REAR',
      kind: 'PHOTO',
      capturedAt: NOW,
      expiresAt: LATER,
      durationSeconds: null,
      url: null,
      urlExpiresInSeconds: null,
      contentType: 'image/jpeg',
    },
    {
      mediaId: HERMETIC_FLEET_MEDIA_VIDEO,
      slot: 'VIDEO',
      kind: 'VIDEO',
      capturedAt: NOW,
      expiresAt: LATER,
      durationSeconds: 22,
      // No real video bytes in hermetic runs — the player still renders with a null-safe src.
      url: 'data:video/mp4;base64,',
      urlExpiresInSeconds: 300,
      contentType: 'video/mp4',
    },
  ].filter((item) => !(options.frontRemoved && item.slot === 'FRONT'));
  const media = options.frontRemoved
    ? {
        ...card.media,
        status: 'MISSING',
        current: false,
        missingSlots: ['FRONT'],
        slots: card.media.slots.map((slot) =>
          slot.slot === 'FRONT' ? { ...slot, status: 'MISSING', mediaId: null } : slot,
        ),
      }
    : card.media;
  return {
    ...card,
    media,
    canBid: !options.frontRemoved,
    bidBlockers: options.frontRemoved ? ['MEDIA_MISSING'] : [],
    driver: {
      ...card.driver,
      photo: { ...card.driver.photo, url: HERMETIC_IMAGE_DATA_URL, urlExpiresInSeconds: 300 },
    },
    mediaItems: items,
  };
}

export function hermeticRefund(overrides: Record<string, unknown> = {}) {
  return {
    id: HERMETIC_REFUND_ID,
    bookingId: HERMETIC_REFUND_BOOKING_ID,
    checkoutId: 'aaaaaaaa-0000-4000-8000-0000000000e3',
    kind: 'CUSTOMER_ADVANCE',
    reason: 'CUSTOMER_CANCEL',
    status: 'FAILED',
    amountPaise: 12000,
    providerPaymentId: 'pay_hermetic_refund_q',
    providerRefundId: null,
    attempts: 2,
    lastError: 'BAD_REQUEST_ERROR: hermetic provider rejection',
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

export const HERMETIC_GARAGE_ACCESS = {
  orgId: HERMETIC_GARAGE_V4_ORG_ID,
  orgName: 'Hermetic Garage Partner',
  state: 'FreeBids',
  canBid: true,
  storeEligible: true,
  reason: null,
  freeBidsPerWeek: 2,
  freeBidsUsedThisWeek: 1,
  freeBidsBonusThisWeek: 3,
  freeBidsRemaining: 4,
  freeBidsResetAt: '2026-11-09T18:30:00.000Z',
  activePass: null,
  unlimitedUntil: null,
};

export const HERMETIC_GARAGE_PASS = {
  purchaseId: 'aaaaaaaa-0000-4000-8000-0000000000c1',
  kind: 'DAY',
  amountRupees: 99,
  startsAt: NOW,
  endsAt: '2026-11-04T09:00:00.000Z',
  purchasedAt: NOW,
  source: 'CHECKOUT',
  checkoutId: 'aaaaaaaa-0000-4000-8000-0000000000c2',
  paymentRef: 'pay_hermetic_pass_1',
  invoiceNumber: 'INV-HERM-1',
};

export function hermeticGarageRevenueRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'aaaaaaaa-0000-4000-8000-0000000000c1',
    purchaseId: 'aaaaaaaa-0000-4000-8000-0000000000c1',
    checkoutId: 'aaaaaaaa-0000-4000-8000-0000000000c2',
    orgId: HERMETIC_GARAGE_V4_ORG_ID,
    orgName: 'Hermetic Garage Partner',
    kind: 'DAY_PASS',
    amountPaise: 9900,
    paymentRef: 'pay_hermetic_pass_1',
    providerOrderId: 'order_hermetic_1',
    createdAt: NOW,
    ...overrides,
  };
}

export const HERMETIC_SOURCE_CLIP = {
  clipId: HERMETIC_CLIP_ID,
  title: 'Hermetic brake squeal fix',
  captionExcerpt: 'How we fixed a squealing brake in 20 minutes.',
  authorDisplayName: 'Hermetic Garage Partner',
  authorType: 'GARAGE',
  mediaKind: 'VIDEO',
  thumbnailUrl: HERMETIC_IMAGE_DATA_URL,
  thumbnailUrlExpiresInSeconds: 300,
  snapshotAt: NOW,
};

export const HERMETIC_GARAGE_V4_FIELDS = {
  requestKind: 'SERVICE',
  placeId: 'ChIJhermetic',
  locationLabel: 'Hermetic Motors, Kothrud, Pune',
  lat: 18.5074,
  lng: 73.8077,
  vehicle: {
    vehicleId: 'aaaaaaaa-0000-4000-8000-000000000004',
    make: 'Hyundai',
    model: 'Creta',
    displayName: 'Hyundai Creta',
    plateMasked: 'MH12••34',
  },
  photoCount: 1,
  sourceClipId: HERMETIC_CLIP_ID,
  sourceClip: HERMETIC_SOURCE_CLIP,
};

export const HERMETIC_GARAGE_PHOTO = {
  id: HERMETIC_GARAGE_PHOTO_ID,
  url: HERMETIC_IMAGE_DATA_URL,
  urlExpiresInSeconds: 300,
  contentType: 'image/svg+xml',
  sortOrder: 0,
  createdAt: NOW,
};
