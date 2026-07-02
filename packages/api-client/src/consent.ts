import type { ApiClient } from './client.js';
import { endpoints } from './endpoints.js';
import { unwrapEnvelope } from './envelope.js';

export type ConsentPurpose = 'ACCOUNT' | 'MANDATE' | 'MARKETING' | 'COMMUNITY' | 'TELEMATICS';

export type GrantConsentBody = {
  purpose: ConsentPurpose;
  noticeVersion: string;
};

export type ConsentItem = {
  purpose: ConsentPurpose;
  status: 'GRANTED' | 'WITHDRAWN';
  noticeVersion: string;
  grantedAt: string;
  withdrawnAt: string | null;
};

/** POST /v1/me/consents */
export async function grantConsent(
  client: ApiClient,
  body: GrantConsentBody,
): Promise<ConsentItem> {
  const response = await client.post<unknown>(endpoints.consents.grant, body);
  return unwrapEnvelope(response) as ConsentItem;
}

/** GET /v1/me/consents */
export async function listConsents(client: ApiClient): Promise<ConsentItem[]> {
  const response = await client.get<unknown>(endpoints.consents.list);
  return unwrapEnvelope(response) as ConsentItem[];
}
