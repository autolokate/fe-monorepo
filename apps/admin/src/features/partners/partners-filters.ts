import type {
  AdminGarageRequestStatus,
  AdminPartnerType,
  AdminTaxiRequestStatus,
} from '@autolokate/api-client';

export type FilterOption<T extends string> = { value: T; label: string };

export const PARTNER_TYPE_FILTERS: FilterOption<AdminPartnerType>[] = [
  { value: 'GARAGE', label: 'Garage' },
  { value: 'STORE', label: 'Store' },
  { value: 'TAXI', label: 'Taxi' },
];

export const GARAGE_REQUEST_STATUS_FILTERS: FilterOption<AdminGarageRequestStatus | 'ALL'>[] = [
  { value: 'ALL', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'AWARDED', label: 'Awarded' },
  { value: 'CLOSED', label: 'Closed' },
];

export const TAXI_REQUEST_STATUS_FILTERS: FilterOption<AdminTaxiRequestStatus | 'ALL'>[] = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'OPEN', label: 'Open' },
  { value: 'AWARDED', label: 'Awarded' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'CANCELLED_BY_CUSTOMER', label: 'Cancelled' },
];

export function formatPartnersDateTime(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
}

export function formatRupees(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function shortId(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}
