import { cn } from '../../../utils/cn';

import type { AlFieldProps } from './Field.types';
import './Field.css';

export function AlField({ label, value, tone = 'default', className, ...props }: AlFieldProps) {
  return (
    <div className={cn('al-readonly-field', tone === 'muted' && 'al-readonly-field--muted', className)} {...props}>
      <span className="al-readonly-field__label">{label}</span>
      <span className="al-readonly-field__value">{value}</span>
    </div>
  );
}
