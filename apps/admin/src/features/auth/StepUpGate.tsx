import { AlButton, AlOtpInput } from '@autolokate/ui';
import { useState } from 'react';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { useAdminAuth } from '@/providers/AdminAuthProvider';

/**
 * Admin-plane step-up (2FA). The server refuses every `/admin/v1/*` call without the `step_up`
 * claim. Signing in with the phone OTP straight into OPERATOR already carries it (the login OTP is
 * the fresh verification), so this screen is NOT shown after login — only when the stepped-up token
 * later lapses (a refreshed token drops it → 403 `step_up_required`) or a restored session lacks it.
 */
export function StepUpGate() {
  const { profile, requestStepUp, verifyStepUp, signOut } = useAdminAuth();
  const [phase, setPhase] = useState<'idle' | 'sent'>('idle');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<string | null>(null);

  const describe = (cause: unknown): string => {
    const mapped = mapAdminApiError(cause);
    if (mapped.status === 404) {
      return 'This server does not offer admin step-up yet. Ask the platform team to deploy POST /v1/auth/step-up/otp/request.';
    }
    if (mapped.code === 'rate_limit') {
      // The SMS provider allows one code per number about every 60 s, and signing in just sent one.
      return 'A code was sent to this number moments ago. Wait about a minute, then send the verification code again.';
    }
    return mapped.code === 'validation' ? mapped.message : mapped.userMessage;
  };

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await requestStepUp();
      setChannel(result.channel);
      setCode('');
      setPhase('sent');
    } catch (cause) {
      setError(describe(cause));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (code.trim().length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await verifyStepUp(code.trim());
    } catch (cause) {
      setError(describe(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login-page" data-testid="admin-step-up">
      <div className="admin-login-card admin-panel">
        <header className="admin-login-brand">
          <p className="admin-login-brand__name">Autolokate</p>
          <h1 className="admin-login-brand__title">Confirm it’s you</h1>
          <p className="admin-login-brand__subtitle">
            Admin tools need a second verification{profile?.name ? ` for ${profile.name}` : ''}.
            We’ll send a one-time code to the phone on your operator account.
          </p>
        </header>

        {phase === 'idle' ? (
          <div className="admin-login-form">
            {error ? (
              <p className="admin-login-error" role="alert">
                {error}
              </p>
            ) : null}
            <AlButton
              data-testid="admin-step-up-send"
              loading={busy}
              onClick={() => {
                void send();
              }}
            >
              Send verification code
            </AlButton>
            <AlButton
              variant="secondary"
              onClick={() => {
                void signOut();
              }}
            >
              Sign out
            </AlButton>
          </div>
        ) : (
          <form
            className="admin-login-form"
            onSubmit={(event) => {
              event.preventDefault();
              void verify();
            }}
          >
            <p className="admin-login-otp-hint">
              Code sent{channel ? ` via ${channel.toUpperCase()}` : ''} to your account phone.
            </p>
            <div className="admin-field admin-login-otp">
              <span className="admin-login-otp__label">Verification code</span>
              <AlOtpInput length={6} value={code} onChange={setCode} />
            </div>
            {error ? (
              <p className="admin-login-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="admin-login-actions">
              <AlButton
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  void send();
                }}
              >
                Resend
              </AlButton>
              <AlButton type="submit" data-testid="admin-step-up-verify" loading={busy}>
                Verify
              </AlButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
