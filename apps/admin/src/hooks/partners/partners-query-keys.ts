import type {
  AdminGarageRequestStatus,
  AdminPartnerType,
  AdminTaxiRequestStatus,
} from '@autolokate/api-client';

export type PartnersDirectoryListParams = {
  type: AdminPartnerType;
  q: string;
};

export type GarageRequestsListParams = {
  status: AdminGarageRequestStatus | 'ALL';
};

export type TaxiRequestsListParams = {
  status: AdminTaxiRequestStatus | 'ALL';
};

export const partnersQueryKeys = {
  all: ['admin', 'partners'] as const,
  directory: () => [...partnersQueryKeys.all, 'directory'] as const,
  directoryList: (params: PartnersDirectoryListParams) =>
    [...partnersQueryKeys.directory(), 'list', params] as const,
  detail: (orgId: string) => [...partnersQueryKeys.all, 'detail', orgId] as const,
  garageRequests: () => [...partnersQueryKeys.all, 'garage-requests'] as const,
  garageRequestsList: (params: GarageRequestsListParams) =>
    [...partnersQueryKeys.garageRequests(), 'list', params] as const,
  garageRequestDetail: (id: string) =>
    [...partnersQueryKeys.garageRequests(), 'detail', id] as const,
  taxiRequests: () => [...partnersQueryKeys.all, 'taxi-requests'] as const,
  taxiRequestsList: (params: TaxiRequestsListParams) =>
    [...partnersQueryKeys.taxiRequests(), 'list', params] as const,
  taxiRequestDetail: (id: string) => [...partnersQueryKeys.taxiRequests(), 'detail', id] as const,
};

export const PARTNERS_LIST_LIMIT = 20;
