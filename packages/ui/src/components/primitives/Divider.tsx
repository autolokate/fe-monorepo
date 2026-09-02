import type { HTMLAttributes } from 'react';

import { cn } from '../../utils/cn';
import './Divider.css';

export type DividerOrientation = 'horizontal' | 'vertical';
export type AlDividerOrientation = DividerOrientation;

export type DividerProps = HTMLAttributes<HTMLHRElement> & {
  orientation?: DividerOrientation;
};
export type AlDividerProps = DividerProps;

export function AlDivider({ orientation = 'horizontal', className, ...props }: DividerProps) {
  return <hr className={cn('al-divider', `al-divider--${orientation}`, className)} {...props} />;
}
