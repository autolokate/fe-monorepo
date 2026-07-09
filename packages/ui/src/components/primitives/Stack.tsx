import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/cn';
import './Stack.css';

export type StackGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';

export type StackProps = HTMLAttributes<HTMLDivElement> & {
  direction?: 'row' | 'column';
  gap?: StackGap;
  align?: 'start' | 'center' | 'stretch';
  justify?: 'start' | 'center' | 'between';
  children: ReactNode;
};

export function Stack({
  direction = 'column',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  className,
  children,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        'al-stack',
        `al-stack--${direction}`,
        `al-stack--gap-${gap}`,
        `al-stack--align-${align}`,
        `al-stack--justify-${justify}`,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
