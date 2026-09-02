import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { setThemeMode } from '@autolokate/design-system';
import { AlButton, AlHeading, AlStack, AlText } from '@autolokate/ui';

import type { PrepaidScreenState } from '@/features/qr-prepaid/types';
import { PR01PrepaidEntryScreen } from '@/features/qr-prepaid/screens/pr01-prepaid-entry/index';
import { PR02ActivationCodeScreen } from '@/features/qr-prepaid/screens/pr02-activation-code/index';
import { PR03CodeValidationScreen } from '@/features/qr-prepaid/screens/pr03-code-validation/index';
import { demoMobileDisplay, demoOtp } from '@/features/shared-auth/data/demo-data';
import {
  A1MobileScreen,
  A2OtpScreen,
  A3VehicleOwnerScreen,
  S0SplashScreen,
} from '@/features/shared-auth/screens/index';
import { L1PrivacyPolicyScreen } from '@/features/shared-legal/screens/l1-privacy-policy/index';
import { L2TermsConditionsScreen } from '@/features/shared-legal/screens/l2-terms-conditions/index';
import type { AuthMobileState, AuthOtpState } from '@/features/shared-auth/types';
import { R01VehicleNumberScreen } from '@/features/purchase-activation/screens/r01-vehicle-number/index';
import { R02VehicleDetailsScreen } from '@/features/purchase-activation/screens/r02-vehicle-details/index';
import { R05AccountCreationScreen } from '@/features/purchase-activation/screens/r05-account-creation/index';
import { R06LegalConsentScreen } from '@/features/purchase-activation/screens/r06-legal-consent/index';
import {
  E01RiderPromptScreen,
  E02RiderMobileScreen,
  E03RiderOtpScreen,
  E04RiderNameScreen,
  E05ContactsEmptyScreen,
  E06ContactMobileScreen,
  E07ContactOtpScreen,
  E08ContactNameScreen,
  E09ContactsSummaryScreen,
  E10RidersSummaryScreen,
} from '@/features/emergency/screens/index';
import { R03VehicleNumberScreen } from '@/features/qr-purchase/screens/r03-vehicle-number/index';
import { R04FetchingVehicleScreen } from '@/features/qr-purchase/screens/r04-fetching-vehicle/index';
import { R04bFetchFailedScreen } from '@/features/qr-purchase/screens/r04b-fetch-failed/index';
import { R05ConfirmVehicleScreen } from '@/features/qr-purchase/screens/r05-confirm-vehicle/index';
import { R08OrderSummaryScreen } from '@/features/qr-purchase/screens/r08-order-summary/index';
import { R08bPromoAppliedScreen } from '@/features/qr-purchase/screens/r08b-promo-applied/index';
import { R08cInvalidPromoScreen } from '@/features/qr-purchase/screens/r08c-invalid-promo/index';
import { R06ChoosePlanScreen } from '@/features/qr-purchase/screens/r06-choose-plan/index';
import { DEFAULT_PURCHASE_PLAN_ID } from '@/features/qr-purchase/data/purchase-plans';
import type { PurchasePlanId } from '@/features/qr-purchase/types-checkout';
import { R07RiderCoverScreen } from '@/features/qr-purchase/screens/r07-rider-cover/index';
import { R09ProcessingPaymentScreen } from '@/features/qr-purchase/screens/r09-processing-payment/index';
import { R09bStillConfirmingScreen } from '@/features/qr-purchase/screens/r09b-still-confirming/index';
import { R10PaymentSuccessScreen } from '@/features/qr-purchase/screens/r10-payment-success/index';
import { R10bPaymentFailedScreen } from '@/features/qr-purchase/screens/r10b-payment-failed/index';
import { R10cPaymentUnconfirmedScreen } from '@/features/qr-purchase/screens/r10c-payment-unconfirmed/index';
import { PrepaidWelcomeScreen } from '@/features/qr-prepaid/screens/prepaid-welcome/index';
import { PartnerWelcomeScreen } from '@/features/qr-b2b2c/screens/partner-welcome/index';
import { DevCompletedPreview } from '@/dev/DevCompletedPreview';
import { JourneyProvider } from '@/journey/JourneyContext';
import type { PurchaseVehiclePlateState } from '@/features/qr-purchase/types-vehicle';
import { demoPlate } from '@/features/purchase-activation/data/demo-data';
import type { ScreenViewState } from '@/types/flow';

const demoMobile = demoMobileDisplay;

import '@/styles/dev-preview.css';

type SharedDevScreen = {
  id: string;
  label: string;
  group: 'shared';
  render: () => ReactElement;
};

type SharedAuthStateScreen = {
  id: string;
  label: string;
  group: 'shared';
  render: (state: AuthMobileState | AuthOtpState) => ReactElement;
};

type PurchaseVehicleDevScreen = {
  id: 'r03';
  label: string;
  group: 'purchase';
  render: (state: PurchaseVehiclePlateState) => ReactElement;
};

type PurchasePhaseAStatusDevScreen = {
  id: 'r04' | 'r04b' | 'r05';
  label: string;
  group: 'purchase';
  render: () => ReactElement;
};

type PurchaseStatusDevScreen = {
  id: string;
  label: string;
  group: 'purchase';
  render: () => ReactElement;
};

type PrepaidDevScreen = {
  id: string;
  label: string;
  group: 'prepaid';
  render: (state: PrepaidScreenState) => ReactElement;
};

export type EmergencyDevState = 'default' | 'error' | 'offline' | 'loading' | 'network-error';

type EmergencyDevScreen = {
  id: string;
  label: string;
  group: 'emergency';
  states: readonly string[];
  render: (state: string) => ReactElement;
};

type FlowDevScreen = {
  id: string;
  label: string;
  group: 'b2b2c' | 'completed' | 'prepaid-welcome';
  render: () => ReactElement;
};

const emergencySummaryContact = {
  name: 'Anita Sharma',
  mobile: demoMobile,
  relation: 'spouse' as const,
  verified: true,
};

const emergencyRider = {
  name: 'Rahul Sharma',
  mobile: demoMobile,
  relation: 'child' as const,
};

const emergencyScreens: EmergencyDevScreen[] = [
  {
    id: 'e01',
    label: 'E01 · R0 Rider prompt',
    group: 'emergency',
    states: ['default', 'loading', 'error', 'offline'],
    render: (state) => (
      <E01RiderPromptScreen
        viewState={
          state === 'loading'
            ? 'loading'
            : state === 'error'
              ? 'error'
              : state === 'offline'
                ? 'offline'
                : 'default'
        }
      />
    ),
  },
  {
    id: 'e02',
    label: 'E02 · R1 Rider mobile',
    group: 'emergency',
    states: ['default', 'error', 'offline'],
    render: (state) => (
      <E02RiderMobileScreen
        mobileState={state === 'error' ? 'error' : state === 'offline' ? 'offline' : 'default'}
      />
    ),
  },
  {
    id: 'e03',
    label: 'E03 · R2 Rider OTP',
    group: 'emergency',
    states: ['default', 'error', 'loading', 'network-error'],
    render: (state) => (
      <E03RiderOtpScreen
        mobile={demoMobile}
        otpState={
          state === 'loading'
            ? 'verifying'
            : state === 'network-error'
              ? 'network-error'
              : state === 'error'
                ? 'error'
                : 'default'
        }
        otpErrorKind={state === 'error' ? 'wrong' : null}
        resendCooldownSeconds={state === 'default' ? 24 : 0}
      />
    ),
  },
  {
    id: 'e04',
    label: 'E04 · R3 Rider name',
    group: 'emergency',
    states: ['default', 'loading', 'error'],
    render: (state) => (
      <E04RiderNameScreen
        relation="spouse"
        nameValue="Rahul Sharma"
        formState={state === 'loading' ? 'submitting' : state === 'error' ? 'error' : 'default'}
      />
    ),
  },
  {
    id: 'e05',
    label: 'E05 · E0 Contacts empty',
    group: 'emergency',
    states: ['default'],
    render: () => <E05ContactsEmptyScreen />,
  },
  {
    id: 'e06',
    label: 'E06 · E1 Contact mobile',
    group: 'emergency',
    states: ['default', 'error', 'offline'],
    render: (state) => (
      <E06ContactMobileScreen
        mobileState={state === 'error' ? 'error' : state === 'offline' ? 'offline' : 'default'}
      />
    ),
  },
  {
    id: 'e07',
    label: 'E07 · E2 Contact OTP',
    group: 'emergency',
    states: ['default', 'error', 'loading', 'network-error'],
    render: (state) => (
      <E07ContactOtpScreen
        mobile={demoMobile}
        otpState={
          state === 'loading'
            ? 'verifying'
            : state === 'network-error'
              ? 'network-error'
              : state === 'error'
                ? 'error'
                : 'default'
        }
        otpErrorKind={state === 'error' ? 'wrong' : null}
        resendCooldownSeconds={state === 'default' ? 24 : 0}
      />
    ),
  },
  {
    id: 'e08',
    label: 'E08 · E3 Contact name',
    group: 'emergency',
    states: ['default', 'error'],
    render: (state) => (
      <E08ContactNameScreen
        relation={state === 'error' ? undefined : 'spouse'}
        nameValue={state === 'error' ? '' : 'Anita Sharma'}
      />
    ),
  },
  {
    id: 'e09',
    label: 'E09 · E5 Contacts summary',
    group: 'emergency',
    states: ['default', 'error'],
    render: (state) => (
      <E09ContactsSummaryScreen
        planId={state === 'error' ? 'shield' : 'secure'}
        contacts={
          state === 'error'
            ? [
                emergencySummaryContact,
                { ...emergencySummaryContact, name: 'Ravi Mehta', mobile: '9876543211' },
                { ...emergencySummaryContact, name: 'Priya Shah', mobile: '9876543212' },
              ]
            : [emergencySummaryContact]
        }
      />
    ),
  },
  {
    id: 'e10',
    label: 'E10 · R4 Riders summary',
    group: 'emergency',
    states: ['default', 'max'],
    render: (state) => (
      <E10RidersSummaryScreen
        planId="secure"
        purchasedRiderSlots={2}
        riders={
          state === 'max'
            ? [emergencyRider, { ...emergencyRider, name: 'Sneha Sharma', mobile: '9876543211' }]
            : [emergencyRider]
        }
        onAddAnother={() => undefined}
      />
    ),
  },
];

const sharedAuthScreens: SharedAuthStateScreen[] = [
  {
    id: 's0',
    label: 'S0 · Splash',
    group: 'shared',
    render: () => <S0SplashScreen />,
  },
  {
    id: 'a1-empty',
    label: 'A1 · Mobile · Empty',
    group: 'shared',
    render: () => <A1MobileScreen mobileState="empty" />,
  },
  {
    id: 'a1-filled',
    label: 'A1 · Mobile · Filled',
    group: 'shared',
    render: () => <A1MobileScreen mobileState="filled" mobileValue="99999 99999" />,
  },
  {
    id: 'a1-ready',
    label: 'A1 · Mobile · Ready',
    group: 'shared',
    render: () => <A1MobileScreen mobileState="ready" mobileValue="99999 99999" consentAccepted />,
  },
  {
    id: 'a1-error',
    label: 'A1 · Mobile · Error',
    group: 'shared',
    render: () => <A1MobileScreen mobileState="error" mobileValue="99999 99999" consentAccepted />,
  },
  {
    id: 'a1-offline',
    label: 'A1 · Mobile · Offline',
    group: 'shared',
    render: () => (
      <A1MobileScreen mobileState="offline" mobileValue="99999 99999" consentAccepted />
    ),
  },
  {
    id: 'a2-default',
    label: 'A2 · OTP · Default',
    group: 'shared',
    render: () => <A2OtpScreen mobile="9999999999" resendCooldownSeconds={24} />,
  },
  {
    id: 'a2-typing',
    label: 'A2 · OTP · Typing',
    group: 'shared',
    render: () => <A2OtpScreen otpState="typing" mobile="9999999999" otpValue="123" />,
  },
  {
    id: 'a2-verifying',
    label: 'A2 · OTP · Verifying',
    group: 'shared',
    render: () => <A2OtpScreen otpState="verifying" mobile="9999999999" otpValue={demoOtp} />,
  },
  {
    id: 'a2-success',
    label: 'A2 · OTP · Success',
    group: 'shared',
    render: () => <A2OtpScreen otpState="success" mobile="9999999999" otpValue={demoOtp} />,
  },
  {
    id: 'a2-error',
    label: 'A2 · OTP · Error',
    group: 'shared',
    render: () => (
      <A2OtpScreen
        otpState="error"
        mobile="9999999999"
        otpValue="111111"
        otpErrorKind="wrong"
        resendCooldownSeconds={0}
      />
    ),
  },
  {
    id: 'a2-network',
    label: 'A2 · OTP · Network error',
    group: 'shared',
    render: () => <A2OtpScreen otpState="network-error" mobile="9999999999" otpValue={demoOtp} />,
  },
  {
    id: 'a2-resend',
    label: 'A2 · OTP · Resend',
    group: 'shared',
    render: () => (
      <A2OtpScreen
        otpState="resend"
        mobile="9999999999"
        otpValue={demoOtp}
        resendCooldownSeconds={0}
      />
    ),
  },
  {
    id: 'a2-resend-failed',
    label: 'A2 · OTP · Resend failed',
    group: 'shared',
    render: () => <A2OtpScreen otpState="resend-failed" mobile="9999999999" otpValue={demoOtp} />,
  },
  {
    id: 'a3-empty',
    label: 'A3 · Vehicle owner · Empty',
    group: 'shared',
    render: () => <A3VehicleOwnerScreen />,
  },
  {
    id: 'a3-filled',
    label: 'A3 · Vehicle owner · Filled',
    group: 'shared',
    render: () => <A3VehicleOwnerScreen nameValue="Kapil Sharma" nameState="filled" />,
  },
  {
    id: 'l1',
    label: 'L1 · Privacy Policy',
    group: 'shared',
    render: () => <L1PrivacyPolicyScreen />,
  },
  {
    id: 'l2',
    label: 'L2 · Terms & Conditions',
    group: 'shared',
    render: () => <L2TermsConditionsScreen />,
  },
];

const deprecatedPurchaseScreens: SharedDevScreen[] = [
  {
    id: 'r01',
    label: 'R01 · Vehicle Number (deprecated)',
    group: 'shared',
    render: () => <R01VehicleNumberScreen />,
  },
  {
    id: 'r02',
    label: 'R02 · Vehicle Details (deprecated)',
    group: 'shared',
    render: () => <R02VehicleDetailsScreen />,
  },
  {
    id: 'r05',
    label: 'R05 · Account Creation (deprecated)',
    group: 'shared',
    render: () => <R05AccountCreationScreen />,
  },
  {
    id: 'r06',
    label: 'R06 · Legal Consent (deprecated)',
    group: 'shared',
    render: () => <R06LegalConsentScreen />,
  },
];

const purchasePhaseAScreens: (PurchaseVehicleDevScreen | PurchasePhaseAStatusDevScreen)[] = [
  {
    id: 'r03',
    label: 'R03 · Vehicle number',
    group: 'purchase',
    render: (state) => (
      <R03VehicleNumberScreen plateValue={state === 'empty' ? '' : demoPlate} plateState={state} />
    ),
  },
  {
    id: 'r04',
    label: 'R04 · Fetching details',
    group: 'purchase',
    render: () => <R04FetchingVehicleScreen />,
  },
  {
    id: 'r04b',
    label: 'R04b · Fetch failed',
    group: 'purchase',
    render: () => <R04bFetchFailedScreen />,
  },
  {
    id: 'r05',
    label: 'R05 · Confirm vehicle',
    group: 'purchase',
    render: () => <R05ConfirmVehicleScreen />,
  },
];

const purchasePhaseBScreens: PurchaseStatusDevScreen[] = [
  {
    id: 'r06-plan',
    label: 'R06 · Choose plan',
    group: 'purchase',
    render: () => <></>,
  },
  {
    id: 'r07',
    label: 'R07 · Rider cover',
    group: 'purchase',
    render: () => (
      <R07RiderCoverScreen
        selectedPlanId="secure"
        riderOptions={[
          {
            riderCount: 1,
            pricePaise: 9900,
            originalPricePaise: 19900,
            discountPercent: 50,
          },
          {
            riderCount: 2,
            pricePaise: 14900,
            originalPricePaise: 39800,
            discountPercent: 63,
          },
        ]}
        selectedRiderCount={1}
        onSelectRiderCount={() => undefined}
      />
    ),
  },
  {
    id: 'r08',
    label: 'R08 · Order summary',
    group: 'purchase',
    render: () => <R08OrderSummaryScreen selectedPlanId="secure" riderCount={1} />,
  },
  {
    id: 'r08b',
    label: 'R08b · Promo applied',
    group: 'purchase',
    render: () => (
      <R08bPromoAppliedScreen selectedPlanId="secure" riderCount={1} promoCode="FRIEND50" />
    ),
  },
  {
    id: 'r08c',
    label: 'R08c · Invalid promo',
    group: 'purchase',
    render: () => (
      <R08cInvalidPromoScreen
        selectedPlanId="secure"
        riderCount={1}
        promoCode="BADCODE"
        onPromoCodeChange={() => undefined}
        onApplyPromo={() => undefined}
      />
    ),
  },
];

const purchasePhaseCScreens: PurchaseStatusDevScreen[] = [
  {
    id: 'r09',
    label: 'R09 · Processing payment',
    group: 'purchase',
    render: () => <R09ProcessingPaymentScreen />,
  },
  {
    id: 'r09b',
    label: 'R09b · Still confirming',
    group: 'purchase',
    render: () => <R09bStillConfirmingScreen />,
  },
  {
    id: 'r10',
    label: 'R10 · Payment success (terminal)',
    group: 'purchase',
    render: () => <R10PaymentSuccessScreen selectedPlanId="secure" paidAmountInr={1948} />,
  },
  {
    id: 'r10b',
    label: 'R10b · Payment failed',
    group: 'purchase',
    render: () => <R10bPaymentFailedScreen />,
  },
  {
    id: 'r10c',
    label: 'R10c · Payment unconfirmed',
    group: 'purchase',
    render: () => <R10cPaymentUnconfirmedScreen onCheckStatus={() => undefined} />,
  },
];

const flowScreens: FlowDevScreen[] = [
  {
    id: 'prepaid-welcome',
    label: 'Prepaid · Welcome',
    group: 'prepaid-welcome',
    render: () => <PrepaidWelcomeScreen />,
  },
  {
    id: 'b2b2c-plan-only',
    label: 'B2B2C · Plan only',
    group: 'b2b2c',
    render: () => <PartnerWelcomeScreen variant="plan-only" />,
  },
  {
    id: 'b2b2c-plan-rider',
    label: 'B2B2C · Plan + rider',
    group: 'b2b2c',
    render: () => <PartnerWelcomeScreen variant="plan-rider" />,
  },
  {
    id: 'completed',
    label: 'Journey · Completed',
    group: 'completed',
    render: () => <DevCompletedPreview />,
  },
];

const prepaidScreens: PrepaidDevScreen[] = [
  {
    id: 'pr01',
    label: 'PR01 · Pre-paid Entry',
    group: 'prepaid',
    render: (state) => <PR01PrepaidEntryScreen state={state} />,
  },
  {
    id: 'pr02',
    label: 'PR02 · Activation Code',
    group: 'prepaid',
    render: (state) => <PR02ActivationCodeScreen state={state} />,
  },
  {
    id: 'pr03',
    label: 'PR03 · Code Validation',
    group: 'prepaid',
    render: (state) => <PR03CodeValidationScreen state={state} />,
  },
];

const sharedStates: ScreenViewState[] = ['default', 'loading', 'error', 'empty', 'success'];
const purchaseVehicleStates: PurchaseVehiclePlateState[] = ['empty', 'filled', 'error', 'loading'];
const r06PlanStates: PurchasePlanId[] = ['safe', 'secure', 'shield', 'shield-plus'];
const prepaidStates: PrepaidScreenState[] = ['default', 'loading', 'error', 'success'];
const emergencyStates: EmergencyDevState[] = [
  'default',
  'error',
  'offline',
  'loading',
  'network-error',
];

const viewportWidths = [320, 360, 375, 390, 393, 414] as const;
const THEME_KEY = 'al-qr-theme';

function DevFlowFrame({ children }: { children: ReactElement }) {
  return <JourneyProvider initialPhase="activation">{children}</JourneyProvider>;
}

function readCaptureParams() {
  const params = new URLSearchParams(window.location.search);
  const width = Number(params.get('width'));
  const theme = params.get('theme');
  return {
    captureMode: params.get('capture') === '1',
    screen: params.get('screen'),
    state: params.get('state'),
    width: viewportWidths.includes(width as (typeof viewportWidths)[number]) ? width : null,
    theme: theme === 'light' || theme === 'dark' ? theme : null,
  };
}

const allSharedSidebarScreens = [...sharedAuthScreens, ...deprecatedPurchaseScreens];

const defaultSharedScreen = allSharedSidebarScreens[0] as SharedAuthStateScreen;

export function ScreenDevApp() {
  const initialParams = useMemo(() => readCaptureParams(), []);
  const [activeScreen, setActiveScreen] = useState(initialParams.screen ?? 's0');
  const [activeState, setActiveState] = useState<string>(initialParams.state ?? 'default');
  const [viewportWidth, setViewportWidth] = useState<number>(initialParams.width ?? 390);
  const [showChrome, setShowChrome] = useState(!initialParams.captureMode);
  const [themeMode, setThemeModeState] = useState<'light' | 'dark'>(() => {
    if (initialParams.theme === 'light' || initialParams.theme === 'dark') {
      return initialParams.theme;
    }
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    window.localStorage.setItem(THEME_KEY, themeMode);
    document.body.dataset.devCaptureReady = 'true';
    document.body.dataset.devScreen = activeScreen;
    document.body.dataset.devState = activeState;
    document.body.dataset.devTheme = themeMode;
    document.body.dataset.devWidth = String(viewportWidth);
  }, [activeScreen, activeState, themeMode, viewportWidth]);

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    document.documentElement.setAttribute('data-theme', next);
    window.localStorage.setItem(THEME_KEY, next);
    setThemeModeState(next);
  };

  const isPrepaid = activeScreen.startsWith('pr');
  const isEmergency = activeScreen.startsWith('e');
  const isFlowScreen = flowScreens.some((screen) => screen.id === activeScreen);
  const isPurchasePhaseA = ['r03', 'r04', 'r04b', 'r05'].includes(activeScreen);
  const isPurchasePhaseB = ['r06-plan', 'r07', 'r08', 'r08b', 'r08c'].includes(activeScreen);
  const isPurchasePhaseC = ['r09', 'r09b', 'r10', 'r10b', 'r10c'].includes(activeScreen);
  const isSharedAuthFrame =
    activeScreen.startsWith('s0') ||
    activeScreen.startsWith('a1') ||
    activeScreen.startsWith('a2') ||
    activeScreen.startsWith('l');
  const sharedAuthEntry = sharedAuthScreens.find((screen) => screen.id === activeScreen);
  const deprecatedEntry = deprecatedPurchaseScreens.find((screen) => screen.id === activeScreen);
  const purchasePhaseAEntry = purchasePhaseAScreens.find((screen) => screen.id === activeScreen);
  const purchasePhaseBEntry = purchasePhaseBScreens.find((screen) => screen.id === activeScreen);
  const purchasePhaseCEntry = purchasePhaseCScreens.find((screen) => screen.id === activeScreen);
  const prepaidEntry = prepaidScreens.find((screen) => screen.id === activeScreen);
  const emergencyEntry = emergencyScreens.find((screen) => screen.id === activeScreen);
  const flowEntry = flowScreens.find((screen) => screen.id === activeScreen);
  const stateOptions = isEmergency
    ? (emergencyEntry?.states ?? emergencyStates)
    : activeScreen === 'r06-plan'
      ? r06PlanStates
      : isPrepaid
        ? prepaidStates
        : isPurchasePhaseA && activeScreen === 'r03'
          ? purchaseVehicleStates
          : isSharedAuthFrame
            ? []
            : sharedStates;

  const resolvedSharedState = useMemo((): ScreenViewState => {
    if (sharedStates.includes(activeState as ScreenViewState)) {
      return activeState as ScreenViewState;
    }
    return 'default';
  }, [activeState]);

  const resolvedPurchaseVehicleState = useMemo((): PurchaseVehiclePlateState => {
    if (purchaseVehicleStates.includes(activeState as PurchaseVehiclePlateState)) {
      return activeState as PurchaseVehiclePlateState;
    }
    return 'empty';
  }, [activeState]);

  const resolvedPrepaidState = useMemo((): PrepaidScreenState => {
    if (prepaidStates.includes(activeState as PrepaidScreenState)) {
      return activeState as PrepaidScreenState;
    }
    return 'default';
  }, [activeState]);

  const resolvedEmergencyState = useMemo((): string => {
    if (emergencyEntry?.states.includes(activeState)) {
      return activeState;
    }
    return 'default';
  }, [activeState, emergencyEntry?.states]);

  const resolvedR06PlanId = useMemo((): PurchasePlanId => {
    if (r06PlanStates.includes(activeState as PurchasePlanId)) {
      return activeState as PurchasePlanId;
    }
    return DEFAULT_PURCHASE_PLAN_ID;
  }, [activeState]);

  const activeStateMatches = (state: string) =>
    resolvedSharedState === state ||
    resolvedPurchaseVehicleState === state ||
    resolvedPrepaidState === state ||
    resolvedEmergencyState === state;

  const frameContent =
    isEmergency && emergencyEntry ? (
      emergencyEntry.render(resolvedEmergencyState)
    ) : isFlowScreen && flowEntry ? (
      <DevFlowFrame>{flowEntry.render()}</DevFlowFrame>
    ) : isPrepaid && prepaidEntry ? (
      prepaidEntry.render(resolvedPrepaidState)
    ) : isPurchasePhaseA && purchasePhaseAEntry ? (
      purchasePhaseAEntry.id === 'r03' ? (
        purchasePhaseAEntry.render(resolvedPurchaseVehicleState)
      ) : (
        purchasePhaseAEntry.render()
      )
    ) : isPurchasePhaseB && purchasePhaseBEntry ? (
      purchasePhaseBEntry.id === 'r06-plan' ? (
        <R06ChoosePlanScreen
          selectedPlanId={resolvedR06PlanId}
          onSelectPlan={(planId) => {
            setActiveState(planId);
          }}
          showBack={false}
        />
      ) : (
        purchasePhaseBEntry.render()
      )
    ) : isPurchasePhaseC && purchasePhaseCEntry ? (
      purchasePhaseCEntry.render()
    ) : sharedAuthEntry ? (
      sharedAuthEntry.render('default')
    ) : deprecatedEntry ? (
      deprecatedEntry.render()
    ) : (
      defaultSharedScreen.render('default')
    );

  return (
    <div className={initialParams.captureMode ? 'ob-dev ob-dev--capture' : 'ob-dev'}>
      {showChrome ? (
        <aside className="ob-dev__panel">
          <AlStack gap="md">
            <AlHeading variant="h3">QR · Dev preview</AlHeading>
            <AlText tone="muted">
              Shared + Purchase + Prepaid + Emergency — no routing or API
            </AlText>
            <AlText variant="label">Shared Auth (Figma 91:268)</AlText>
            <AlStack gap="xs">
              {sharedAuthScreens.map((screen) => (
                <AlButton
                  key={screen.id}
                  size="sm"
                  variant={activeScreen === screen.id ? 'primary' : 'secondary'}
                  onClick={() => {
                    setActiveScreen(screen.id);
                    setActiveState('default');
                  }}
                >
                  {screen.label}
                </AlButton>
              ))}
            </AlStack>
            <AlText variant="label">Purchase activation (deprecated)</AlText>
            <AlStack gap="xs">
              {deprecatedPurchaseScreens.map((screen) => (
                <AlButton
                  key={screen.id}
                  size="sm"
                  variant={activeScreen === screen.id ? 'primary' : 'secondary'}
                  onClick={() => {
                    setActiveScreen(screen.id);
                    setActiveState('default');
                  }}
                >
                  {screen.label}
                </AlButton>
              ))}
            </AlStack>
            <AlText variant="label">Purchase · Phase A (R03–R05)</AlText>
            <AlStack gap="xs">
              {purchasePhaseAScreens.map((screen) => (
                <AlButton
                  key={screen.id}
                  size="sm"
                  variant={activeScreen === screen.id ? 'primary' : 'secondary'}
                  onClick={() => {
                    setActiveScreen(screen.id);
                    setActiveState(screen.id === 'r03' ? 'empty' : 'default');
                  }}
                >
                  {screen.label}
                </AlButton>
              ))}
            </AlStack>
            <AlText variant="label">Purchase · Phase B (R06–R08c)</AlText>
            <AlStack gap="xs">
              {purchasePhaseBScreens.map((screen) => (
                <AlButton
                  key={screen.id}
                  size="sm"
                  variant={activeScreen === screen.id ? 'primary' : 'secondary'}
                  onClick={() => {
                    setActiveScreen(screen.id);
                    setActiveState(screen.id === 'r06-plan' ? DEFAULT_PURCHASE_PLAN_ID : 'default');
                  }}
                >
                  {screen.label}
                </AlButton>
              ))}
            </AlStack>
            <AlText variant="label">Purchase · Phase C (R09–R10c)</AlText>
            <AlStack gap="xs">
              {purchasePhaseCScreens.map((screen) => (
                <AlButton
                  key={screen.id}
                  size="sm"
                  variant={activeScreen === screen.id ? 'primary' : 'secondary'}
                  onClick={() => {
                    setActiveScreen(screen.id);
                    setActiveState('default');
                  }}
                >
                  {screen.label}
                </AlButton>
              ))}
            </AlStack>
            <AlText variant="label">Prepaid (Phase 7)</AlText>
            <AlStack gap="xs">
              {prepaidScreens.map((screen) => (
                <AlButton
                  key={screen.id}
                  size="sm"
                  variant={activeScreen === screen.id ? 'primary' : 'secondary'}
                  onClick={() => {
                    setActiveScreen(screen.id);
                    setActiveState('default');
                  }}
                >
                  {screen.label}
                </AlButton>
              ))}
            </AlStack>
            <AlText variant="label">B2B2C · Prepaid welcome · Completed</AlText>
            <AlStack gap="xs">
              {flowScreens.map((screen) => (
                <AlButton
                  key={screen.id}
                  size="sm"
                  variant={activeScreen === screen.id ? 'primary' : 'secondary'}
                  onClick={() => {
                    setActiveScreen(screen.id);
                    setActiveState('default');
                  }}
                >
                  {screen.label}
                </AlButton>
              ))}
            </AlStack>
            <AlText variant="label">Emergency (Phase 11b)</AlText>
            <AlStack gap="xs">
              {emergencyScreens.map((screen) => (
                <AlButton
                  key={screen.id}
                  size="sm"
                  variant={activeScreen === screen.id ? 'primary' : 'secondary'}
                  onClick={() => {
                    setActiveScreen(screen.id);
                    setActiveState('default');
                  }}
                >
                  {screen.label}
                </AlButton>
              ))}
            </AlStack>
            {stateOptions.length > 0 ? (
              <>
                <AlText variant="label">View state</AlText>
                <div className="ob-dev__state-row">
                  {stateOptions.map((state) => (
                    <AlButton
                      key={state}
                      size="sm"
                      variant={activeStateMatches(state) ? 'primary' : 'secondary'}
                      onClick={() => {
                        setActiveState(state);
                      }}
                    >
                      {state}
                    </AlButton>
                  ))}
                </div>
              </>
            ) : null}
            <AlText variant="label">Viewport width</AlText>
            <div className="ob-dev__state-row">
              {viewportWidths.map((width) => (
                <AlButton
                  key={width}
                  size="sm"
                  variant={viewportWidth === width ? 'primary' : 'secondary'}
                  onClick={() => {
                    setViewportWidth(width);
                  }}
                >
                  {width}
                </AlButton>
              ))}
            </div>
            <AlText variant="label">Theme</AlText>
            <div className="ob-dev__state-row">
              <AlButton
                size="sm"
                variant={themeMode === 'dark' ? 'primary' : 'secondary'}
                onClick={() => {
                  if (themeMode !== 'dark') {
                    toggleTheme();
                  }
                }}
              >
                Dark
              </AlButton>
              <AlButton
                size="sm"
                variant={themeMode === 'light' ? 'primary' : 'secondary'}
                onClick={() => {
                  if (themeMode !== 'light') {
                    toggleTheme();
                  }
                }}
              >
                Light
              </AlButton>
            </div>
            <AlButton
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowChrome(false);
              }}
            >
              Hide panel
            </AlButton>
          </AlStack>
        </aside>
      ) : (
        <button
          type="button"
          className="ob-dev__reopen"
          onClick={() => {
            setShowChrome(true);
          }}
        >
          Show panel
        </button>
      )}
      <div
        className="ob-dev__viewport"
        style={{ ['--ob-dev-viewport-width' as string]: `${String(viewportWidth)}px` }}
      >
        <div className="ob-dev__frame" data-dev-frame>
          {frameContent}
        </div>
      </div>
    </div>
  );
}
