import { AlStack } from '@autolokate/ui';

import {
  AddContactRow,
  EmergencyContactRow,
} from '@/components/compositions/index.js';
import { FlowStepShell } from '@/components/flow-step-shell/index.js';
import type { PurchasePlanId } from '@/features/qr-purchase/types-checkout.js';
import {
  canAddEmergencyContact,
  getContactsMaxReachedMessage,
  getContactsSummaryDescription,
  getEmergencyPlanLimits,
} from '../../emergency-limits.js';
import type { EmergencyContact, EmergencyScreenNavigationProps } from '../../types.js';

import '../../emergency.css';

export type E09ContactsSummaryScreenProps = EmergencyScreenNavigationProps & {
  contacts: EmergencyContact[];
  planId: PurchasePlanId;
  onAddAnother?: () => void;
};

/** E5 · Contacts summary — Figma 373:64 · 717:2237 (contacts only; riders follow via R0–R4) */
export function E09ContactsSummaryScreen({
  contacts,
  planId,
  onAddAnother,
  onContinue,
  onBack,
  showBack = true,
}: E09ContactsSummaryScreenProps) {
  const count = contacts.length;
  const { maxEmergencyContacts, minEmergencyContacts } = getEmergencyPlanLimits(planId);
  const canAddMoreContacts = canAddEmergencyContact(count, planId);
  const isContactsMaxReached = count >= maxEmergencyContacts;

  return (
    <FlowStepShell
      phase="emergency"
      step={10}
      title="Emergency contacts"
      description={getContactsSummaryDescription(count, planId)}
      footerLabel="Continue"
      footerDisabled={count < minEmergencyContacts}
      hideProgress
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
    >
      <AlStack gap="lg" className="ob-contact-summary">
        <AlStack gap="md" className="ob-contact-card-list">
          {contacts.map((contact) => (
            <EmergencyContactRow key={`${contact.mobile}-${contact.name}`} contact={contact} />
          ))}
          {canAddMoreContacts ? (
            <AddContactRow onClick={onAddAnother} disabled={!onAddAnother} />
          ) : isContactsMaxReached ? (
            <p className="ob-emergency-max-message">{getContactsMaxReachedMessage(planId)}</p>
          ) : null}
        </AlStack>
      </AlStack>
    </FlowStepShell>
  );
}
