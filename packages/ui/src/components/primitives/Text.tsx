import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/cn';
import './Text.css';

export type TextVariant =
  | 'display'
  | 'headline'
  | 'title'
  | 'subtitle'
  | 'bodyLarge'
  | 'body'
  | 'label'
  | 'caption'
  | 'mono';

export type TextTone = 'default' | 'muted' | 'on-primary';

export type AlTextProps = HTMLAttributes<HTMLElement> & {
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'label' | 'div';
  variant?: TextVariant;
  tone?: TextTone;
  align?: 'start' | 'center';
  children: ReactNode;
};

export function AlText({
  as: Component = 'p',
  variant = 'body',
  tone = 'default',
  align = 'start',
  className,
  children,
  ...props
}: AlTextProps) {
  const variantClass = variant === 'bodyLarge' ? 'body-large' : variant;
  return (
    <Component
      className={cn(
        'al-text',
        `al-text--${variantClass}`,
        tone === 'muted' && 'al-text--muted',
        tone === 'on-primary' && 'al-text--on-primary',
        align === 'center' && 'al-text--center',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
