import type { ReactNode } from 'react';

import {
  ICON_DEFAULT_SIZE,
  ICON_DEFAULT_STROKE_WIDTH,
  ICON_VIEW_BOX,
  type IconProps,
} from './types';

export function IconSvg({
  size = ICON_DEFAULT_SIZE,
  className,
  strokeWidth = ICON_DEFAULT_STROKE_WIDTH,
  'aria-label': ariaLabel,
  children,
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={ICON_VIEW_BOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      role={ariaLabel ? 'img' : undefined}
      strokeWidth={strokeWidth}
      {...props}
    >
      {children}
    </svg>
  );
}
