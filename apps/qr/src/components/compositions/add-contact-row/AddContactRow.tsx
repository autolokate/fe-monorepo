import { AlIcon } from '@autolokate/icons';
import { AlText } from '@autolokate/ui';

import './add-contact-row.css';

export type AddContactRowProps = {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function AddContactRow({
  label = 'Add another contact',
  onClick,
  disabled = false,
}: AddContactRowProps) {
  return (
    <button type="button" className="ob-add-contact-row" disabled={disabled} onClick={onClick}>
      <AlIcon name="plus" size={18} aria-hidden />
      <AlText variant="label">{label}</AlText>
    </button>
  );
}
