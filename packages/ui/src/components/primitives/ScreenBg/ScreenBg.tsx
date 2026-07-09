import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../../utils/cn';
import './ScreenBg.css';

export type AlScreenBgVariant = 'default' | 'protected' | 'attention' | 'emergency';

export type AlScreenBgProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlScreenBgVariant;
  children?: ReactNode;
};

export function AlScreenBg({
  variant = 'default',
  className,
  children,
  ...props
}: AlScreenBgProps) {
  return (
    <div
      className={cn('al-screen-bg', variant !== 'default' && `al-screen-bg--${variant}`, className)}
      {...props}
    >
      {variant !== 'default' ? (
        <div className="al-screen-bg__tint" aria-hidden="true" />
      ) : null}
      {children ? <div className="al-screen-bg__content">{children}</div> : null}
    </div>
  );
}
