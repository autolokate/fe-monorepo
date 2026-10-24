#!/usr/bin/env node
/**
 * Dev authentication matrix runner (pre-migration).
 *
 * Requires:
 *   DEV_API_BASE_URL (default: canonical Dev CF)
 *   DEV_QA_OTP — fixed Dev OTP for allowlisted phones only (never commit)
 *   Optional phone overrides via env (see below)
 *
 * Never prints tokens or OTP. Exit 0 only if all enabled cases match expected.
 */
import assert from 'node:assert/strict';

const CANONICAL_DEV = 'https://d1wpatcmpyt0pw.cloudfront.net';
const FORBIDDEN = new Set(['api-staging.autolokate.com', 'api.autolokate.com']);

const base = (process.env.DEV_API_BASE_URL || CANONICAL_DEV).replace(/\/$/, '');
const otp = process.env.DEV_QA_OTP || '';
const consumerPhone = process.env.DEV_QA_CONSUMER_PHONE || '+917982828887';
const adminPhone = process.env.DEV_QA_ADMIN_PHONE || '+919999999999';
const nonAllowlisted = process.env.DEV_QA_NON_ALLOWLISTED_PHONE || '+919999999991';

const host = new URL(base).host;
if (FORBIDDEN.has(host)) {
  console.error(JSON.stringify({ ok: false, error: 'refusing staging/prod host', host }));
  process.exit(2);
}

const results = [];

async function req(method, path, { body, token } = {}) {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-json */
  }
  const blob = text;
  return { status: res.status, json, otpEchoed: Boolean(otp) && blob.includes(otp) };
}

function record(id, expected, actual, detail = {}) {
  const pass = expected === actual;
  results.push({ id, expected, actual, pass, ...detail });
  const line = `${pass ? 'PASS' : 'FAIL'} ${id} expected=${expected} actual=${actual}`;
  console.log(JSON.stringify({ line, ...detail, tokensRedacted: true }));
  return pass;
}

async function main() {
  if (!otp || !/^\d{6}$/.test(otp)) {
    console.error(
      JSON.stringify({
        ok: false,
        error: 'DEV_QA_OTP must be set to a 6-digit Dev fixed OTP (not committed)',
      }),
    );
    process.exit(2);
  }

  let all = true;

  // Environment
  all &= record('env.base_is_dev', true, base === CANONICAL_DEV || host.includes('cloudfront.net'), {
    base,
  });
  all &= record('env.not_staging_host', true, !FORBIDDEN.has(host), { host });

  // Unauth admin
  {
    const r = await req('GET', '/admin/v1/audit-events');
    all &= record('neg.admin_unauth', 401, r.status, { code: r.json?.error?.code });
  }

  // Malformed phone
  {
    const r = await req('POST', '/v1/auth/otp/request', { body: { phone: '9999999999' } });
    all &= record('neg.malformed_phone_request', 400, r.status, { code: r.json?.error?.code });
  }

  // Allowlisted consumer request
  {
    const r = await req('POST', '/v1/auth/otp/request', { body: { phone: consumerPhone } });
    all &= record('pos.consumer_otp_request', 200, r.status, {
      channel: r.json?.data?.channel,
    });
  }

  // Positive consumer verify
  let consumerToken = null;
  {
    const r = await req('POST', '/v1/auth/otp/verify', {
      body: { phone: consumerPhone, code: otp },
    });
    const ok = r.status === 200 && Boolean(r.json?.data?.accessToken) && !r.otpEchoed;
    all &= record('pos.consumer_otp_verify', true, ok, {
      status: r.status,
      otpEchoed: r.otpEchoed,
    });
    consumerToken = r.json?.data?.accessToken ?? null;
  }

  if (consumerToken) {
    const sess = await req('POST', '/v1/auth/session', { body: {}, token: consumerToken });
    all &= record('pos.consumer_session', 200, sess.status, {
      role: sess.json?.data?.role,
      availableRoles: sess.json?.data?.availableRoles,
    });
    all &= record(
      'pos.consumer_role_is_consumer',
      true,
      sess.json?.data?.role === 'CONSUMER',
      { role: sess.json?.data?.role },
    );

    const adm = await req('GET', '/admin/v1/audit-events', { token: consumerToken });
    all &= record('neg.consumer_admin_forbidden', 403, adm.status, {
      code: adm.json?.error?.code,
    });

    const pa = await req('GET', '/v1/me/protection-access', { token: consumerToken });
    all &= record('pos.consumer_protection_access', 200, pa.status, {
      source: pa.json?.data?.source,
    });

    // refresh
    const verifyAgain = await req('POST', '/v1/auth/otp/verify', {
      body: { phone: consumerPhone, code: otp },
    });
    const refreshToken = verifyAgain.json?.data?.refreshToken;
    if (refreshToken) {
      const ref = await req('POST', '/v1/auth/refresh', { body: { refreshToken } });
      all &= record('pos.consumer_refresh', 200, ref.status, {
        hasTokens: Boolean(ref.json?.data?.accessToken && ref.json?.data?.refreshToken),
      });
    } else {
      all &= record('pos.consumer_refresh', true, false, { reason: 'no_refresh_token' });
    }

    const lo = await req('POST', '/v1/auth/logout', { token: consumerToken });
    all &= record('pos.consumer_logout', 200, lo.status);
  }

  // Wrong OTP
  {
    const r = await req('POST', '/v1/auth/otp/verify', {
      body: { phone: consumerPhone, code: '000000' },
    });
    all &= record('neg.wrong_otp', 401, r.status, { code: r.json?.error?.code });
  }

  // Missing OTP
  {
    const r = await req('POST', '/v1/auth/otp/verify', { body: { phone: consumerPhone } });
    all &= record('neg.missing_otp', 400, r.status, { code: r.json?.error?.code });
  }

  // Non-allowlisted + fixed OTP
  {
    await req('POST', '/v1/auth/otp/request', { body: { phone: nonAllowlisted } });
    const r = await req('POST', '/v1/auth/otp/verify', {
      body: { phone: nonAllowlisted, code: otp },
    });
    all &= record('neg.non_allowlisted_fixed_otp', 401, r.status, {
      code: r.json?.error?.code,
    });
  }

  // Admin candidate — expected fail until allowlist + OPERATOR grant
  {
    await req('POST', '/v1/auth/otp/request', { body: { phone: adminPhone } });
    const r = await req('POST', '/v1/auth/otp/verify', {
      body: { phone: adminPhone, code: otp },
    });
    const detail = {
      status: r.status,
      note:
        r.status === 200
          ? 'allowlisted; still must verify OPERATOR role separately'
          : 'expected until SM allowlist includes admin E.164 + role grant',
    };
    if (r.status === 200 && r.json?.data?.accessToken) {
      const sess = await req('POST', '/v1/auth/session', {
        body: {},
        token: r.json.data.accessToken,
      });
      detail.role = sess.json?.data?.role;
      detail.availableRoles = sess.json?.data?.availableRoles;
      const isOperator = (sess.json?.data?.availableRoles || []).includes('OPERATOR');
      all &= record('pos.admin_otp_verify', true, true, detail);
      all &= record('pos.admin_has_operator_role', true, isOperator, detail);
      if (isOperator) {
        const adm = await req('GET', '/admin/v1/audit-events', {
          token: r.json.data.accessToken,
        });
        // May be 200 or 403 depending on step_up; accept not 401
        all &= record('pos.admin_api_not_unauth', true, adm.status !== 401, {
          status: adm.status,
          code: adm.json?.error?.code,
        });
      }
    } else {
      // Document as BLOCKED outcome without failing the whole runner when EXPECT_ADMIN!=1
      const requireAdmin = process.env.EXPECT_ADMIN === '1';
      if (requireAdmin) {
        all &= record('pos.admin_otp_verify', 200, r.status, detail);
      } else {
        results.push({
          id: 'pos.admin_otp_verify',
          expected: '200_after_allowlist',
          actual: r.status,
          pass: null,
          blocked: true,
          ...detail,
        });
        console.log(
          JSON.stringify({
            line: `BLOCKED pos.admin_otp_verify status=${r.status}`,
            ...detail,
          }),
        );
      }
    }
  }

  // Invalid JWT
  {
    const r = await req('GET', '/admin/v1/audit-events', { token: 'not-a-jwt' });
    all &= record('neg.invalid_jwt_admin', 401, r.status, { code: r.json?.error?.code });
  }

  const blocked = results.filter((r) => r.blocked);
  const failed = results.filter((r) => r.pass === false);
  const summary = {
    ok: failed.length === 0,
    base,
    host,
    passed: results.filter((r) => r.pass === true).length,
    failed: failed.length,
    blocked: blocked.length,
    consumerPhone,
    adminPhone,
    nonAllowlisted,
  };
  console.log(JSON.stringify({ summary }));
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err) }));
  process.exit(1);
});
