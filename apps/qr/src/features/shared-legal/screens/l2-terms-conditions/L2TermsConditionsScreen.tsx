import { AlButton, AlHeading, AlScreenBg, AlStack, AlText } from '@autolokate/ui';

import { LegalReaderHeader } from '../../components/LegalReaderHeader.js';
import { legalLastUpdated, termsSections } from '../../data/legal-content.js';
import type { L2TermsConditionsScreenProps } from '@/features/shared-auth/types.js';

import './legal-reader.css';

/** L2 · Terms & Conditions — Figma 61:163 */
export function L2TermsConditionsScreen({ onBack, onContinue, showBack = true }: L2TermsConditionsScreenProps) {
  return (
    <AlScreenBg variant="protected" className="ob-step-chrome-screen ob-legal-reader">
      <div className="ob-step-chrome__frame ob-legal-reader__frame">
        <LegalReaderHeader onBack={onBack} showBack={showBack} />
        <main className="ob-step-chrome__body ob-legal-reader__body">
          <div className="ob-step-chrome__heading ob-legal-reader__heading">
            <AlHeading variant="h2">Terms & Conditions</AlHeading>
          </div>
          <AlText variant="caption" tone="muted">
            {legalLastUpdated}
          </AlText>
          <AlStack gap="md">
            {termsSections.map((section) => (
              <div key={section.heading} className="ob-legal-reader__section">
                <AlText className="ob-legal-reader__section-heading">{section.heading}</AlText>
                <AlText tone="muted">{section.body}</AlText>
              </div>
            ))}
          </AlStack>
        </main>
        <footer className="ob-step-chrome__footer ob-legal-reader__footer">
          <AlButton
            variant="primary"
            className="ob-step-chrome__cta ob-legal-reader__cta"
            onClick={onContinue ?? onBack}
          >
            Got it
          </AlButton>
        </footer>
      </div>
    </AlScreenBg>
  );
}
