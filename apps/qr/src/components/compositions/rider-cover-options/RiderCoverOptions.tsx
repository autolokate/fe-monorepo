import { AlIcon } from '@autolokate/icons';
import { formatInrFromPaise } from '@autolokate/utils';

import type { PurchaseRiderOption } from '@/features/qr-purchase/types-checkout';

import './rider-cover-options.css';

export type RiderCoverOptionView = {
  count: 1 | 2;
  label: string;
  discountLabel: string;
  icon: 'user' | 'users';
  priceLabel: string;
  strikePriceLabel: string;
};

export type RiderCoverOptionsProps = {
  options: readonly RiderCoverOptionView[];
  selectedCount: 1 | 2;
  onSelect: (count: 1 | 2) => void;
};

export function mapRiderOptionsToView(
  options: readonly PurchaseRiderOption[],
): readonly RiderCoverOptionView[] {
  return options.map((option) => ({
    count: option.riderCount,
    label: option.riderCount === 1 ? '1 rider' : '2 riders',
    discountLabel: `${String(option.discountPercent)}% OFF`,
    icon: option.riderCount === 1 ? 'user' : 'users',
    priceLabel: `${formatInrFromPaise(option.pricePaise)}/yr`,
    strikePriceLabel: formatInrFromPaise(option.originalPricePaise),
  }));
}

/** Figma R07 layout — option cards driven by GET /v1/activation/plans riderOptions. */
export function RiderCoverOptions({ options, selectedCount, onSelect }: RiderCoverOptionsProps) {
  return (
    <div className="ob-rider-cover-options" role="radiogroup" aria-label="Rider cover options">
      {options.map((option) => {
        const selected = option.count === selectedCount;
        return (
          <button
            key={option.count}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`ob-rider-cover-option${selected ? ' ob-rider-cover-option--selected' : ''}`}
            onClick={() => {
              onSelect(option.count);
            }}
          >
            <span className="ob-rider-cover-option__radio-slot" aria-hidden>
              <span className="ob-rider-cover-option__radio ob-rider-cover-option__radio--empty" />
              <AlIcon
                name="circle-check"
                size={22}
                className="ob-rider-cover-option__radio ob-rider-cover-option__radio--check"
              />
            </span>
            <AlIcon name={option.icon} size={22} className="ob-rider-cover-option__icon" aria-hidden />
            <div className="ob-rider-cover-option__body">
              <div className="ob-rider-cover-option__title-row">
                <span className="ob-rider-cover-option__title">{option.label}</span>
                <span className="ob-rider-cover-option__discount">{option.discountLabel}</span>
              </div>
              <span className="ob-rider-cover-option__subtitle">Cover for each rider</span>
            </div>
            <div className="ob-rider-cover-option__price-col">
              <span className="ob-rider-cover-option__price">{option.priceLabel}</span>
              <span className="ob-rider-cover-option__strike">{option.strikePriceLabel}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
