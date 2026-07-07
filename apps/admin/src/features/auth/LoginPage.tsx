import { zodResolver } from '@hookform/resolvers/zod';
import { AlButton, AlOtpInput, AlStack, AlText, AlTextField } from '@autolokate/ui';
import { formatAdminLoginMobile } from '@/services/auth/admin-auth-format.js';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { adminPaths } from '@/app/routes/admin-paths.js';
import { useAdminAuth } from '@/providers/AdminAuthProvider.js';

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
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
        <AlStack gap="md">
          <AlStack gap="xs">
            <AlText variant="headline">Sign in to Admin</AlText>
            <AlText tone="muted">
              Use your Autolokate staff mobile number. Admin APIs require a bearer session.
            </AlText>
          </AlStack>

          {step === 'phone' ? (
            <form
              onSubmit={(event) => {
                void submitPhone(event);
              }}
            >
              <AlStack gap="md">
                <AlTextField
                  label="Mobile number"
                  inputMode="numeric"
                  autoComplete="tel"
                  {...phoneForm.register('phone')}
                  errorText={phoneForm.formState.errors.phone?.message}
                />
                {error ? <AlText tone="muted">{error}</AlText> : null}
                <AlButton type="submit" loading={submitting}>
                  Send OTP
                </AlButton>
              </AlStack>
            </form>
          ) : (
            <form
              onSubmit={(event) => {
                void submitOtp(event);
              }}
            >
              <AlStack gap="md">
                <AlText tone="muted">OTP sent to +91 {phone}</AlText>
                <AlOtpInput
                  length={6}
                  value={otpForm.watch('code')}
                  onChange={(value) => {
                    otpForm.setValue('code', value, { shouldValidate: true });
                  }}
                  errorText={otpForm.formState.errors.code?.message}
                />
                {error ? <AlText tone="muted">{error}</AlText> : null}
                <AlStack gap="sm" direction="row">
                  <AlButton
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setStep('phone');
                    }}
                  >
                    Back
                  </AlButton>
                  <AlButton type="submit" loading={submitting}>
                    Verify & continue
                  </AlButton>
                </AlStack>
              </AlStack>
            </form>
          )}
        </AlStack>
      </div>
    </div>
  );
}
