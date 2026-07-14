import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import {
  PURCHASE_ROUTE_ID,
} from '@/journey/state/purchase-journey-state-machine';
import { PurchaseRouteGate } from '../../guards/PurchaseRouteGate';
import { PurchaseIndexRedirect } from '../../guards/PurchaseIndexRedirect';
import {
  legacyPurchasePathRedirectsForActiveJourney,
} from '../../purchase/purchase-paths-runtime';
import {
  parsePurchaseVehicleConfirmationPath,
  parsePurchaseVehicleLookupPath,
  PURCHASE_ROUTE_SEGMENTS,
} from '../../purchase/purchase-routing';
import { stripOnboardingPrefix } from '../../routing/journey-url-routing';
import { PurchaseWelcomeScreen } from '../../../features/qr-purchase/screens/purchase-welcome/index';
import {
  ChoosePlanRoute,
  OrderSummaryInvalidPromoRoute,
  OrderSummaryPromoAppliedRoute,
  OrderSummaryRoute,
  RiderCoverRoute,
} from './purchase-checkout-routes';
import {
  PaymentFailedRoute,
  PaymentStillConfirmingRoute,
  PaymentSuccessRoute,
  PaymentUnconfirmedRoute,
  ProcessingPaymentRoute,
} from './purchase-payment-routes';
import {
  VehicleConfirmationRoute,
  VehicleDetailsRoute,
  VehicleLookupFailedRoute,
  VehicleLookupRoute,
} from './purchase-vehicle-routes';

export function resolvePurchaseRouteContent(pathname: string): ReactNode {
  const path = stripOnboardingPrefix(pathname).replace(/\/+$/, '') || '/';

  for (const [legacySegment, canonicalPath] of legacyPurchasePathRedirectsForActiveJourney()) {
    if (path === `/${legacySegment}`) {
      return <Navigate to={canonicalPath} replace />;
    }
  }

  if (path === `/${PURCHASE_ROUTE_SEGMENTS.welcome}`) {
    return <PurchaseWelcomeScreen />;
  }

  const lookupRegistration = parsePurchaseVehicleLookupPath(path);
  if (lookupRegistration) {
    return (
      <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.vehicleLookup}>
        <VehicleLookupRoute registrationNumber={lookupRegistration} />
      </PurchaseRouteGate>
    );
  }

  const confirmationRegistration = parsePurchaseVehicleConfirmationPath(path);
  if (confirmationRegistration) {
    return (
      <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.vehicleConfirmation}>
        <VehicleConfirmationRoute registrationNumber={confirmationRegistration} />
      </PurchaseRouteGate>
    );
  }

  switch (path) {
    case `/${PURCHASE_ROUTE_SEGMENTS.vehicleDetails}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.vehicleDetails}>
          <VehicleDetailsRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.vehicleLookupFailed}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.vehicleLookupFailed}>
          <VehicleLookupFailedRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.choosePlan}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.choosePlan}>
          <ChoosePlanRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.riderCover}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.riderCover}>
          <RiderCoverRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.orderSummary}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.orderSummary}>
          <OrderSummaryRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.orderSummaryPromoApplied}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.orderSummaryPromoApplied}>
          <OrderSummaryPromoAppliedRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.orderSummaryInvalidPromo}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.orderSummaryInvalidPromo}>
          <OrderSummaryInvalidPromoRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.processingPayment}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.processingPayment}>
          <ProcessingPaymentRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.paymentStillConfirming}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.paymentStillConfirming}>
          <PaymentStillConfirmingRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.paymentSuccess}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.paymentSuccess}>
          <PaymentSuccessRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.paymentFailed}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.paymentFailed}>
          <PaymentFailedRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.paymentUnconfirmed}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.paymentUnconfirmed}>
          <PaymentUnconfirmedRoute />
        </PurchaseRouteGate>
      );
    default:
      return <PurchaseIndexRedirect />;
  }
}
