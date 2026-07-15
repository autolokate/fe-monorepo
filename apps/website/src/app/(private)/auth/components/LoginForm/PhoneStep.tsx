'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type SubmitEvent, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRequestOtp } from '@/hooks/auth';
import { BrandWordmark } from '../BrandWordmark';
import { PhoneField } from '../PhoneField';
import { PHONE_DIGITS, normalizePhoneDigits, toE164 } from '../constants';

interface PhoneStepProps {
  safeNext: string;
}

export function PhoneStep({ safeNext }: PhoneStepProps) {
  const router = useRouter();
  const [digits, setDigits] = useState('');

  const requestOtp = useRequestOtp({
    onSuccess: (response, vars) => {
      if (!response.sent) {
        toast.error('Unable to send OTP. Please try again.');
        return;
      }
      toast.success(response.message || 'OTP sent successfully.');
      const q = new URLSearchParams();
      q.set('step', 'otp');
      q.set('phone', vars.phone);
      if (safeNext) q.set('next', safeNext);
      router.replace(`/auth/login?${q.toString()}`);
    },
  });

  function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = normalizePhoneDigits(digits);
    if (clean.length !== PHONE_DIGITS) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    void requestOtp.mutate({ phone: toE164(clean) });
  }

  return (
    <>
      <div className="flex flex-col items-center text-center">
        <Link
          href="/"
          className="mb-8 inline-flex outline-none ring-offset-2 ring-offset-transparent transition hover:opacity-90 focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <BrandWordmark className="h-8 w-auto sm:h-9" />
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
          Sign in with OTP
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Enter your mobile number and we&apos;ll send a one-time code to verify it&apos;s you —
          fast and secure.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <PhoneField
          id="login-phone"
          label="Phone number"
          hint="Include country code (e.g. +91 for India)."
          value={digits}
          onChange={setDigits}
          disabled={requestOtp.isLoading}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- the phone input is the sole, primary control on this dedicated login step; focusing it on mount is the intended UX and there is no preceding content a screen-reader user would skip past
          autoFocus
        />

        <Button
          type="submit"
          className="h-12 w-full gap-2 text-base font-semibold shadow-md [&_svg]:size-4"
          disabled={requestOtp.isLoading}
          size="lg"
        >
          {requestOtp.isLoading ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              <span>Sending code…</span>
            </>
          ) : (
            <>
              <Phone aria-hidden />
              <span>Continue</span>
            </>
          )}
        </Button>
      </form>

      <div className="relative -mx-8 mt-9 sm:-mx-10">
        <div className="w-full border-t border-border/55" />
        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-card px-1.5 py-0.5 shadow-sm">
          <ShieldCheck className="size-3 text-primary" aria-hidden />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{' '}
        <Link
          href="/auth/signup"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
