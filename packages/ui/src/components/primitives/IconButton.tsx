import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/cn';
import './IconButton.css';

export type AlIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
  filled?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function AlIconButton({
  icon,
  label,
  filled = false,
  size = 'md',
  className,
  type = 'button',
  ...props
}: AlIconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'al-icon-button',
        `al-icon-button--${size}`,
        filled && 'al-icon-button--filled',
        className,
      )}
      aria-label={label}
      title={label}
      {...props}
    >
      <span className="al-icon-button__icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}
