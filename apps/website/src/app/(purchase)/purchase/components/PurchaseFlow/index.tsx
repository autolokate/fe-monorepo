'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  getPurchaseSession,
  isAccessTokenLive,
  isPurchaseAuthenticated,
  refreshPurchaseSession,
} from '@/services/purchase';
import {
  MOBILE_LENGTH,
  computePricing,
  getPlan,
  isPurchasePlanId,
  pickSafeOrigin,
} from '../../constants';
import { readPurchaseIntent } from '../../storage';
import type { PurchaseState, PurchaseStep } from '../../types';
import { CheckoutHeader } from '../CheckoutHeader';
import { PlansStep } from '../PlansStep';
import { ConfigureStep } from '../ConfigureStep';
import { LoginStep } from '../LoginStep';
import { AddressStep } from '../AddressStep';
import { SummaryStep } from '../SummaryStep';
import { SuccessStep } from '../SuccessStep';
import { TrackingStep } from '../TrackingStep';
import { ScanStep } from '../ScanStep';
import { PlateStep } from '../PlateStep';
import { ContactsStep } from '../ContactsStep';
import { ActiveStep } from '../ActiveStep';
import styles from './index.module.css';

function buildInitialState(): PurchaseState {
  return {
    step: 'plans',
    planId: 'shield',
    qty: 0,
    mobile: '',
    orderMobile: '',
    email: '',
    otpSent: false,
    otp: '',
    name: '',
    addr: '',
    line2: '',
    pin: '',
    city: '',
    region: '',
    promo: '',
    cartId: null,
    addressId: null,
    orderId: null,
    autoRenew: true,
    payMethod: 'upi',
    plate: '',
    rcVerified: false,
    contact1: '',
    contact2: '',
    addRiders: false,
    accepted: false,
  };
}

export function PurchaseFlow() {
  const router = useRouter();

  const [state, setState] = useState<PurchaseState>(buildInitialState);

  // The page the buyer came from (Home or Pricing), so the entry "back" button
  // returns them exactly there. Resolved from localStorage after mount.
  const [origin, setOrigin] = useState('/pricing');

  // When the buyer lands straight on "configure" (via a plan card), the in-flow
  // "browse all plans" step is not part of their history — so "back" exits to
  // the origin page instead of the plans screen.
  const [canBrowsePlans, setCanBrowsePlans] = useState(true);

  // localStorage only exists on the client, so read the handoff intent after
  // mount and gate the first paint until we know which screen to show.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const intent = readPurchaseIntent();
    setOrigin(pickSafeOrigin(intent.from ?? null));

    // Restore the verified phone from a live session so a logged-in buyer's
    // order payload / prefill keep working even though they skip the OTP step.
    const session = isPurchaseAuthenticated() ? getPurchaseSession() : null;
    const restoredMobile = session?.phone
      ? session.phone.replace(/\D/g, '').slice(-MOBILE_LENGTH)
      : '';

    // Logged in but the short-lived access token has lapsed? Mint a fresh one
    // from the refresh token now so the first API call doesn't have to 401.
    if (session && !isAccessTokenLive()) {
      void refreshPurchaseSession();
    }

    const storedPlan = intent.plan ?? null;
    if (isPurchasePlanId(storedPlan)) {
      setState((prev) => ({
        ...prev,
        planId: storedPlan,
        step: 'configure',
        mobile: restoredMobile || prev.mobile,
      }));
      setCanBrowsePlans(false);
    } else if (restoredMobile) {
      setState((prev) => ({ ...prev, mobile: restoredMobile }));
    }

    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<PurchaseState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const goTo = useCallback(
    (step: PurchaseStep) => {
      // Already logged in? Skip the phone + OTP step and go straight to shipping.
      const target = step === 'login' && isPurchaseAuthenticated() ? 'address' : step;
      if (target === 'plans') setCanBrowsePlans(true);
      update({ step: target });
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [update],
  );

  const exitToOrigin = useCallback(() => {
    router.push(origin);
  }, [router, origin]);

  const plan = getPlan(state.planId);
  const pricing = useMemo(() => computePricing(plan.price, state.qty), [plan.price, state.qty]);

  const isAuthenticated = hydrated && isPurchaseAuthenticated();

  const stepProps = {
    state,
    plan,
    pricing,
    update,
    goTo,
    exitToOrigin,
    canBrowsePlans,
    isAuthenticated,
  };

  if (!hydrated) {
    return (
      <div className={styles.loading}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <CheckoutHeader step={state.step} />

      <div className={styles.main}>
        {state.step === 'plans' ? <PlansStep {...stepProps} /> : null}
        {state.step === 'configure' ? <ConfigureStep {...stepProps} /> : null}
        {state.step === 'login' ? <LoginStep {...stepProps} /> : null}
        {state.step === 'address' ? <AddressStep {...stepProps} /> : null}
        {state.step === 'summary' ? <SummaryStep {...stepProps} /> : null}
        {state.step === 'success' ? <SuccessStep {...stepProps} /> : null}
        {state.step === 'tracking' ? <TrackingStep {...stepProps} /> : null}
        {state.step === 'scan' ? <ScanStep {...stepProps} /> : null}
        {state.step === 'plate' ? <PlateStep {...stepProps} /> : null}
        {state.step === 'contacts' ? <ContactsStep {...stepProps} /> : null}
        {state.step === 'active' ? <ActiveStep {...stepProps} /> : null}
      </div>
    </div>
  );
}
