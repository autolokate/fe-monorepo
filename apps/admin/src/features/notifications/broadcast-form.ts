import {
  ADMIN_SYSTEM_NOTIFICATION_LIMITS as LIMITS,
  type AdminDeepLinkScreen,
  type AdminNotificationAudience,
  type AdminSystemNotificationBody,
} from '@autolokate/api-client';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ParsedAccountIds = {
  /** Valid, de-duplicated (case-insensitive), lower-cased, in first-seen order. */
  ids: string[];
  invalid: string[];
  duplicates: number;
};

/** Split pasted ids on whitespace / commas / semicolons, de-dupe, and keep only UUIDs. */
export function parseAccountIds(raw: string): ParsedAccountIds {
  const seen = new Set<string>();
  const ids: string[] = [];
  const invalid: string[] = [];
  let duplicates = 0;
  for (const token of raw.split(/[\s,;]+/)) {
    const value = token.trim();
    if (!value) continue;
    if (!UUID.test(value)) {
      invalid.push(value);
      continue;
    }
    const key = value.toLowerCase();
    if (seen.has(key)) {
      duplicates += 1;
      continue;
    }
    seen.add(key);
    ids.push(key);
  }
  return { ids, invalid, duplicates };
}

export type BroadcastDraft = {
  audience: AdminNotificationAudience;
  accountIdsRaw: string;
  title: string;
  body: string;
  deepLinkScreen: AdminDeepLinkScreen | '';
  deepLinkParams: string;
  reason: string;
};

export type BroadcastErrors = Partial<
  Record<'accountIds' | 'title' | 'body' | 'deepLinkParams' | 'reason', string>
>;

/** `null` → no params; otherwise the parsed object or an error string. */
export function parseDeepLinkParams(raw: string): Record<string, unknown> | null | string {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return 'Params must be a JSON object, e.g. {"requestId": "…"}.';
    }
    return parsed as Record<string, unknown>;
  } catch {
    return 'Params are not valid JSON.';
  }
}

/** Client-side mirror of `AdminSystemNotificationDto` bounds — the server stays authoritative. */
export function validateBroadcast(draft: BroadcastDraft): {
  errors: BroadcastErrors;
  body: AdminSystemNotificationBody | null;
} {
  const errors: BroadcastErrors = {};
  const parsed = parseAccountIds(draft.accountIdsRaw);
  if (parsed.invalid.length > 0) {
    errors.accountIds = `${String(parsed.invalid.length)} entr${parsed.invalid.length === 1 ? 'y is' : 'ies are'} not an account UUID (e.g. ${parsed.invalid[0] ?? ''}).`;
  } else if (parsed.ids.length === 0) {
    errors.accountIds = 'Add at least one account ID.';
  } else if (parsed.ids.length > LIMITS.accountIdsMax) {
    errors.accountIds = `At most ${String(LIMITS.accountIdsMax)} accounts per broadcast (you have ${String(parsed.ids.length)}).`;
  }
  const title = draft.title.trim();
  if (!title) errors.title = 'A title is required.';
  else if (title.length > LIMITS.titleMax)
    errors.title = `At most ${String(LIMITS.titleMax)} characters.`;
  const body = draft.body.trim();
  if (!body) errors.body = 'A message is required.';
  else if (body.length > LIMITS.bodyMax)
    errors.body = `At most ${String(LIMITS.bodyMax)} characters.`;
  const params = draft.deepLinkScreen ? parseDeepLinkParams(draft.deepLinkParams) : null;
  if (typeof params === 'string') errors.deepLinkParams = params;
  const reason = draft.reason.trim();
  if (reason.length < LIMITS.reasonMin) {
    errors.reason = `A reason of at least ${String(LIMITS.reasonMin)} characters is required.`;
  } else if (reason.length > LIMITS.reasonMax) {
    errors.reason = `At most ${String(LIMITS.reasonMax)} characters.`;
  }
  if (Object.keys(errors).length > 0) return { errors, body: null };
  return {
    errors,
    body: {
      audience: draft.audience,
      accountIds: parsed.ids,
      title,
      body,
      ...(draft.deepLinkScreen
        ? {
            deepLink: {
              screen: draft.deepLinkScreen,
              ...(params && typeof params === 'object' ? { params } : {}),
            },
          }
        : {}),
      reason,
    },
  };
}
