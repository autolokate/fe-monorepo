import { AlIcon } from '@autolokate/icons';
import { AlText } from '@autolokate/ui';

import './promo-code-field.css';

export type PromoCodeFieldProps = {
  variant: 'empty' | 'applied' | 'editable' | 'invalid';
  promoCode?: string;
  onPromoCodeChange?: (code: string) => void;
  onApply?: () => void;
  onRemove?: () => void;
  errorMessage?: string;
  isApplying?: boolean;
};

/** Figma R08 layout_7TWAFU / R08b layout_YRKE26 / R08c 579:1748 */
export function PromoCodeField({
  variant,
  promoCode = '',
  onPromoCodeChange,
  onApply,
  onRemove,
  errorMessage,
  isApplying = false,
}: PromoCodeFieldProps) {
  if (variant === 'applied' && promoCode) {
    return (
      <div className="ob-promo-code-field ob-promo-code-field--applied">
        <AlIcon name="circle-check" size={20} className="ob-promo-code-field__icon" aria-hidden />
        <AlText className="ob-promo-code-field__code">{promoCode}</AlText>
        <button type="button" className="ob-promo-code-field__action" onClick={onRemove}>
          Remove
        </button>
      </div>
    );
  }

  if (variant === 'editable' || variant === 'invalid') {
    const isInvalid = variant === 'invalid';
    return (
      <div className="ob-promo-code-field-stack">
        <div
          className={`ob-promo-code-field ob-promo-code-field--editable${promoCode.trim() ? ' ob-promo-code-field--filled' : ''}${isInvalid ? ' ob-promo-code-field--invalid' : ''}`}
        >
          <input
            type="text"
            className="ob-promo-code-field__input"
            value={promoCode}
            onChange={
              onPromoCodeChange
                ? (event) => {
                    onPromoCodeChange(event.target.value);
                  }
                : undefined
            }
            placeholder="Have a promo code?"
            aria-invalid={isInvalid || undefined}
            aria-describedby={isInvalid ? 'ob-promo-code-error' : undefined}
            disabled={isApplying}
          />
          <button
            type="button"
            className="ob-promo-code-field__action ob-promo-code-field__action--apply"
            onClick={onApply}
            disabled={!promoCode.trim() || isApplying}
          >
            {isApplying ? 'Applying…' : 'Apply'}
          </button>
        </div>
        {isInvalid && errorMessage ? (
          <p id="ob-promo-code-error" className="ob-field-validation-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="ob-promo-code-field">
      <AlText tone="muted" className="ob-promo-code-field__placeholder">
        Have a promo code?
      </AlText>
      <button
        type="button"
        className="ob-promo-code-field__action ob-promo-code-field__action--apply"
        onClick={onApply}
      >
        Apply
      </button>
    </div>
  );
}
