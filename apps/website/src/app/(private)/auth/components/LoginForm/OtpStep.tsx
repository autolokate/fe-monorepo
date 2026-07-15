'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type SubmitEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRequestOtp, useVerifyOtp } from '@/hooks/auth';
import { BrandWordmark } from '../BrandWordmark';
import { OtpField } from '../OtpField';
import { OTP_LENGTH, RESEND_COOLDOWN_SECONDS, formatPhoneDisplay } from '../constants';

interface OtpStepProps {
  phone: string;
  safeNext: string;
}

export function OtpStep({ phone, safeNext }: OtpStepProps) {
  const router = useRouter();
  const otpInputRef = useRef<HTMLInputElement>(null);

  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const verify = useVerifyOtp({
    onSuccess: () => {
      toast.success('Logged in successfully.');
      router.push(safeNext || '/');
    },
  });

  const resend = useRequestOtp({
    successToast: 'OTP resent.',
    onSuccess: () => {
      setOtp('');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      otpInputRef.current?.focus();
    },
  });

  // Focus once the step mounts.
  useEffect(() => {
    otpInputRef.current?.focus();
  }, []);

  // 30-second resend cooldown tick.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => {
      clearTimeout(t);
    };
  }, [cooldown]);

  function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      toast.error(`Enter the ${String(OTP_LENGTH)}-digit OTP.`);
      return;
    }
    void verify.mutate({ phone, otp });
  }

  function handleChangePhone() {
    setOtp('');
    const q = new URLSearchParams();
    if (safeNext) q.set('next', safeNext);
    router.replace(q.toString() ? `/auth/login?${q.toString()}` : '/auth/login');
  }

  return (
    <>
      <div className="flex flex-col items-center text-center">
        <Link
          href="/"
          className="mb-7 inline-flex outline-none ring-offset-2 ring-offset-transparent transition hover:opacity-90 focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <BrandWordmark className="h-8 w-auto sm:h-9" />
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
          Verify OTP
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Enter the {OTP_LENGTH}-digit code sent to{' '}
          <span className="font-semibold text-foreground">{formatPhoneDisplay(phone)}</span>.
        </p>
      </div>

      <form className="mt-8" onSubmit={submit}>
        <OtpField
          ref={otpInputRef}
          id="login-otp"
          value={otp}
          onChange={setOtp}
          onComplete={(code) => {
            if (!verify.isLoading) void verify.mutate({ phone, otp: code });
          }}
          disabled={verify.isLoading}
        />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Use the OTP received on SMS to continue.
        </p>

        <Button
          type="submit"
          className="mt-7 h-12 w-full gap-2 text-base font-semibold shadow-md [&_svg]:size-4"
          size="lg"
          disabled={verify.isLoading || otp.length !== OTP_LENGTH}
        >
          {verify.isLoading ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              <span>Verifying…</span>
            </>
          ) : (
            <>
              <ShieldCheck aria-hidden />
              <span>Verify &amp; continue</span>
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <button
          type="button"
          className="font-semibold text-primary transition hover:underline disabled:pointer-events-none disabled:text-muted-foreground"
          onClick={() => void resend.mutate({ phone })}
          disabled={resend.isLoading || cooldown > 0}
        >
          {resend.isLoading
            ? 'Resending…'
            : cooldown > 0
              ? `Resend in ${String(cooldown)}s`
              : 'Resend code'}
        </button>
        <span aria-hidden className="h-3 w-px bg-border/70" />
        <button
          type="button"
          className="font-semibold text-primary transition hover:underline"
          onClick={handleChangePhone}
        >
          Change phone
        </button>
      </div>
    </>
  );
}
