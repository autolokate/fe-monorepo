import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type AlButtonCoreVariant = 'primary' | 'secondary' | 'destructive';

export type AlButtonVariant = AlButtonCoreVariant | 'outline' | 'ghost' | 'danger' | 'success';

export type AlButtonSize = 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg' | 'icon';
export type AlButtonRadius = 'sm' | 'md' | 'lg' | 'pill';
export type AlButtonIconPosition = 'start' | 'end';

export type AlButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AlButtonVariant;
  size?: AlButtonSize;
  radius?: AlButtonRadius;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: AlButtonIconPosition;
};
