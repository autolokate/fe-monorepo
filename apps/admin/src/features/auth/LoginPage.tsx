import { zodResolver } from '@hookform/resolvers/zod';
import { AlButton, AlOtpInput } from '@autolokate/ui';
import { formatAdminLoginMobile } from '@/services/auth/admin-auth-format';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { adminPaths } from '@/app/routes/admin-paths';
import { useAdminAuth } from '@/providers/AdminAuthProvider';

const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
});

const otpSchema = phoneSchema.extend({
  code: z.string().trim().length(6, 'Enter the 6-digit OTP'),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

type LoginLocationState = {
  from?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, requestOtp, verifyOtp } = useAdminAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { phone: '', code: '' },
  });

  if (isAuthenticated) {
    const state = location.state as LoginLocationState | null;
    const redirectTo = state?.from ?? adminPaths.dashboard;
    return <Navigate to={redirectTo} replace />;
  }

  const submitPhone = phoneForm.handleSubmit(async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      await requestOtp(formatAdminLoginMobile(values.phone));
      setPhone(values.phone);
      otpForm.setValue('phone', values.phone);
      setStep('otp');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to send OTP.');
    } finally {
      setSubmitting(false);
    }
  });

  const submitOtp = otpForm.handleSubmit(async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      await verifyOtp(formatAdminLoginMobile(values.phone), values.code);
      void navigate(adminPaths.dashboard, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Invalid OTP.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="admin-login-page">
      <div className="admin-login-atmosphere" aria-hidden="true" />
      <div className="admin-login-card admin-panel">
        <header className="admin-login-brand">
          <p className="admin-login-brand__name">Autolokate</p>
          <h1 className="admin-login-brand__title">Admin</h1>
          <p className="admin-login-brand__subtitle">
            Sign in with your staff mobile number. We’ll text a one-time code.
          </p>
        </header>

        {step === 'phone' ? (
          <form
            className="admin-login-form"
            onSubmit={(event) => {
              void submitPhone(event);
            }}
          >
            <label className="admin-field">
              Mobile number
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="10-digit mobile"
                aria-invalid={Boolean(phoneForm.formState.errors.phone)}
                {...phoneForm.register('phone')}
              />
              {phoneForm.formState.errors.phone?.message ? (
                <span className="admin-field__hint" role="alert">
                  {phoneForm.formState.errors.phone.message}
                </span>
              ) : (
                <span className="admin-field__hint">India numbers — we’ll prefix +91</span>
              )}
            </label>
            {error ? <p className="admin-login-error">{error}</p> : null}
            <AlButton type="submit" loading={submitting}>
              Send code
            </AlButton>
          </form>
        ) : (
          <form
            className="admin-login-form"
            onSubmit={(event) => {
              void submitOtp(event);
            }}
          >
            <p className="admin-login-otp-hint">Code sent to +91 {phone}</p>
            <div className="admin-field admin-login-otp">
              <span className="admin-login-otp__label">One-time code</span>
              <AlOtpInput
                length={6}
                value={otpForm.watch('code')}
                onChange={(value) => {
                  otpForm.setValue('code', value, { shouldValidate: true });
                }}
                errorText={otpForm.formState.errors.code?.message}
              />
            </div>
            {error ? <p className="admin-login-error">{error}</p> : null}
            <div className="admin-login-actions">
              <AlButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setStep('phone');
                  setError(null);
                }}
              >
                Back
              </AlButton>
              <AlButton type="submit" loading={submitting}>
                Verify & continue
              </AlButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
