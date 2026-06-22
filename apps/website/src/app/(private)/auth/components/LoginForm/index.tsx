"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { AuthShell } from "../AuthShell";
import { pickSafeNext } from "../constants";
import { OtpStep } from "./OtpStep";
import { PhoneStep } from "./PhoneStep";

/**
 * Two-step login flow on a single route.
 *  - Phone step: `/auth/login`
 *  - OTP step:   `/auth/login?step=otp&phone=+91XXXXXXXXXX[&next=/...]`
 *
 * The query-string contract keeps refreshes safe and shareable.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const safeNext = pickSafeNext(searchParams.get("next"));
  const stepParam = searchParams.get("step");
  const phoneParam = (searchParams.get("phone") ?? "").trim();
  const isOtpStep = stepParam === "otp" && phoneParam.length > 0;

  // If someone lands on `?step=otp` without a phone, drop them back to step 1.
  useEffect(() => {
    if (stepParam === "otp" && !phoneParam) {
      router.replace(safeNext ? `/auth/login?next=${encodeURIComponent(safeNext)}` : "/auth/login");
    }
  }, [stepParam, phoneParam, safeNext, router]);

  return (
    <AuthShell>
      {isOtpStep ? (
        <OtpStep phone={phoneParam} safeNext={safeNext} />
      ) : (
        <PhoneStep safeNext={safeNext} />
      )}
    </AuthShell>
  );
}
