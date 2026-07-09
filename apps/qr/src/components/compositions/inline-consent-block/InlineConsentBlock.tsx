import { AlCheckbox } from '@autolokate/ui';

import './inline-consent-block.css';

export type InlineConsentBlockProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
  /** Disables only the checkbox — legal links stay tappable. */
  disabled?: boolean;
  variant?: 'owner' | 'bystander';
};

/** Figma Mobile inline consent — 102:312 (22×22 checkbox + legal copy). */
export function InlineConsentBlock({
  checked,
  onChange,
  onPrivacyClick,
  onTermsClick,
  disabled = false,
  variant = 'owner',
}: InlineConsentBlockProps) {
  const isBystander = variant === 'bystander';

  return (
    <div className="ob-inline-consent">
      <div className="ob-inline-consent__checkbox-slot">
        <AlCheckbox
          className="ob-inline-consent__checkbox"
          layout="icon-only"
          label={isBystander ? 'Consent to be contacted and Terms' : 'Consent to Privacy Policy and Terms'}
          checked={checked}
          disabled={disabled}
          onChange={(event) => {
            onChange(event.target.checked);
          }}
        />
      </div>
      <p className="ob-inline-consent__copy">
        {isBystander ? (
          <>
            I agree to be contacted about this vehicle, and to Autolokate&apos;s{' '}
            <button type="button" className="ob-inline-consent__link" onClick={onTermsClick}>
              terms
            </button>
            .
          </>
        ) : (
          <>
            So Autolokate can keep you safe and run your vehicle services, I agree to the{' '}
            <button type="button" className="ob-inline-consent__link" onClick={onPrivacyClick}>
              Privacy Policy
            </button>{' '}
            and{' '}
            <button type="button" className="ob-inline-consent__link" onClick={onTermsClick}>
              Terms
            </button>
            . You can withdraw anytime.
          </>
        )}
      </p>
    </div>
  );
}
