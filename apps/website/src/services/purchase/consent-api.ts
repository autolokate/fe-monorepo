"use client";

import { endpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/error";
import { PurchaseApi } from "./client";

export type ConsentPurpose =
  | "ACCOUNT"
  | "MANDATE"
  | "MARKETING"
  | "COMMUNITY"
  | "TELEMATICS";

export type ConsentStatus = "GRANTED" | "WITHDRAWN";

export interface ConsentItem {
  purpose: ConsentPurpose;
  status: ConsentStatus;
  noticeVersion: string;
  grantedAt?: string | null;
  withdrawnAt?: string | null;
}

interface Enveloped<T> {
  data?: T;
}

/**
 * Fallback DPDP notice version, used only if the live privacy notice can't be
 * read. Kept in sync with `GET /v1/legal/documents/PRIVACY_POLICY`.
 */
export const DEFAULT_NOTICE_VERSION = "2026-06-17";

/**
 * The current notice version to pin on a consent grant (A1) — read from
 * `GET /v1/legal/documents` (`data.noticeVersion`). Falls back to
 * {@link DEFAULT_NOTICE_VERSION}.
 */
export async function getNoticeVersion(): Promise<string> {
  try {
    const res = await PurchaseApi.get<Enveloped<{ noticeVersion?: string }>>(
      endpoints.legal.documents,
    );
    return res.data?.data?.noticeVersion || DEFAULT_NOTICE_VERSION;
  } catch {
    return DEFAULT_NOTICE_VERSION;
  }
}

/** POST /v1/me/consents — grant a DPDP consent for one purpose (bearer). */
export async function grantConsent(
  purpose: ConsentPurpose,
  noticeVersion: string,
): Promise<ConsentItem> {
  const res = await PurchaseApi.post<Enveloped<ConsentItem>>(endpoints.me.consents, {
    purpose,
    noticeVersion,
  });
  const item = res.data?.data;
  if (!item?.purpose) throw new ApiError("Invalid consent response", 0, res.data);
  return item;
}

/**
 * Grant the always-on ACCOUNT consent (core service), pinning the current
 * privacy notice version. Called right after OTP verify.
 */
export async function grantAccountConsent(): Promise<ConsentItem> {
  const noticeVersion = await getNoticeVersion();
  return grantConsent("ACCOUNT", noticeVersion);
}

/** GET /v1/me/consents — the buyer's consent ledger (bearer). */
export async function listConsents(): Promise<ConsentItem[]> {
  const res = await PurchaseApi.get<Enveloped<ConsentItem[]>>(endpoints.me.consents);
  return Array.isArray(res.data?.data) ? res.data!.data! : [];
}

/** POST /v1/me/consents/:purpose/withdraw — withdraw a consent (bearer). */
export async function withdrawConsent(purpose: ConsentPurpose): Promise<boolean> {
  const res = await PurchaseApi.post<Enveloped<{ withdrawn?: boolean }>>(
    endpoints.me.withdrawConsent(purpose),
  );
  return Boolean(res.data?.data?.withdrawn);
}
