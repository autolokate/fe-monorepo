'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { LegalDocumentDialog } from '@/components/legal/LegalDocumentDialog';
import type { LegalDocumentKind } from '@/services/legal/legal-client-api';
import { JourneyHeader } from '../../../../../shared/components/JourneyHeader';
import { JourneyProgress } from '../../../../../shared/components/JourneyProgress';
import { JOURNEY_ROUTES } from '../../../../../shared/routes';
import { useVerify } from '../../../../../shared/hooks/useVerify';
import {
  COUNTRY_CODE,
  isPurchaseAuthenticated,
  refreshPurchaseSession,
} from '../../../../../shared/services/auth-api';
import { createJourneyCart } from '../../../../../shared/services/checkout-api';
import { patchJourneyState, readJourneyState } from '../../../../../shared/storage';
import { MobileForm } from '../MobileForm';
import { OtpForm } from '../OtpForm';
import { NameForm } from '../NameForm';
import styles from './index.module.css';

interface VerifyViewProps {
  planId: string;
}

/** Format 10 digits as "98765 43210" for display. */
function formatMobile(mobile: string): string {
  if (mobile.length <= 5) return mobile;
  return `${mobile.slice(0, 5)} ${mobile.slice(5)}`;
}

export function VerifyView({ planId }: VerifyViewProps) {
  const router = useRouter();

  const [legalKind, setLegalKind] = useState<LegalDocumentKind | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Mint the cart once the buyer is authenticated, then hand off to the
  // cart-keyed address route. Guarded so StrictMode / double taps mint one cart.
  const startingRef = useRef(false);
  const startCheckout = useCallback(
    async (replace: boolean) => {
      if (startingRef.current) return;
      startingRef.current = true;
      try {
        const { riderCount } = readJourneyState();
        const cart = await createJourneyCart(planId, riderCount ?? 0);
        patchJourneyState({ planId, cartId: cart.cartId });
        const dest = JOURNEY_ROUTES.address(cart.cartId);
        if (replace) router.replace(dest);
        else router.push(dest);
      } catch {
        startingRef.current = false;
        toast.error('Couldn’t start checkout. Please try again.');
        setCheckingSession(false);
      }
    },
    [planId, router],
  );

  const goNext = useCallback(() => {
    void startCheckout(false);
  }, [startCheckout]);

  const v = useVerify({ onVerified: goNext });

  // Skip verify if the buyer already has a live purchase session; refresh a
  // lapsed access token first so the cart mint starts authenticated.
  useEffect(() => {
    // Object flag (not a `let`) so its value isn't narrowed to a literal across
    // the awaits — keeps the unmount guards honest for the linter and at runtime.
    const alive = { current: true };
    void (async () => {
      if (isPurchaseAuthenticated()) {
        await refreshPurchaseSession();
        if (alive.current) {
          void startCheckout(true);
          return;
        }
      }
      if (alive.current) setCheckingSession(false);
    })();
    return () => {
      alive.current = false;
    };
  }, [startCheckout]);

  const isOtp = v.phase === 'otp';
  const isName = v.phase === 'name';

  return (
    <div className={styles.page}>
      <JourneyHeader />
      <JourneyProgress activeIndex={1} />

      {!checkingSession ? (
        <div className={styles.body}>
          <Link href={JOURNEY_ROUTES.configure(planId)} className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} aria-hidden />
            Back
          </Link>

          <div className={styles.hd}>
            {isName ? (
              <>
                <h1 className={styles.title}>What’s your name?</h1>
                <p className={styles.subhead}>So we can address your order and delivery</p>
              </>
            ) : isOtp ? (
              <>
                <h1 className={styles.title}>Enter the code</h1>
                <p className={styles.subhead}>
                  Sent on WhatsApp to {COUNTRY_CODE} {formatMobile(v.mobile)} ·{' '}
                  <button type="button" className={styles.change} onClick={v.changeMobile}>
                    Change
                  </button>
                </p>
              </>
            ) : (
              <>
                <h1 className={styles.title}>Verify your number</h1>
                <p className={styles.subhead}>We’ll send a one-time code to confirm it’s you</p>
              </>
            )}
          </div>

          {isName ? (
            <NameForm
              name={v.name}
              onNameChange={v.setName}
              error={v.nameError}
              saving={v.savingName}
              canSubmit={v.canSaveName}
              onSubmit={v.submitName}
            />
          ) : isOtp ? (
            <OtpForm
              value={v.otp}
              onChange={v.setOtp}
              error={v.otpError}
              resendIn={v.resendIn}
              onResend={v.resendOtp}
              onSendSms={v.resendOtp}
              verifying={v.verifying}
              canSubmit={v.canVerify}
              onSubmit={v.verify}
            />
          ) : (
            <MobileForm
              mobile={v.mobile}
              onMobileChange={v.setMobile}
              accepted={v.accepted}
              onAcceptedChange={v.setAccepted}
              error={v.mobileError}
              sending={v.sending}
              canSubmit={v.accepted && !v.sending}
              onSubmit={v.sendOtp}
              onOpenLegal={setLegalKind}
            />
          )}
        </div>
      ) : null}

      {legalKind ? (
        <LegalDocumentDialog
          kind={legalKind}
          open
          onOpenChange={(open) => {
            if (!open) setLegalKind(null);
          }}
        />
      ) : null}
    </div>
  );
}
