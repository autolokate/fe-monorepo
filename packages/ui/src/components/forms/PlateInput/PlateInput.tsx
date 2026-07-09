import { useId } from 'react';

import { cn } from '../../../utils/cn';

import type { AlPlateInputProps } from './PlateInput.types';
import { formatPlateInput } from './PlateInput.utils';
import './PlateInput.css';

export function AlPlateInput({
  value,
  onChange,
  placeholder = 'MH 12 AB 3456',
  disabled = false,
  error = false,
  className,
  id,
  'aria-label': ariaLabel = 'Vehicle registration plate',
}: AlPlateInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isFilled = value.trim().length > 0;

  return (
    <div
      className={cn(
        'al-plate-input',
        error && 'al-plate-input--error',
        isFilled && 'al-plate-input--filled',
        className,
      )}
    >
      <div className="al-plate-input__inner">
        <input
          id={inputId}
          className="al-plate-input__value"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-invalid={error || undefined}
          onChange={
            onChange
              ? (event) => {
                  onChange(formatPlateInput(event.target.value));
                }
              : undefined
          }
          readOnly={!onChange}
        />
      </div>
    </div>
  );
}
