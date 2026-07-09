import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/cn';
import './Container.css';

export type ContainerWidth = 'narrow' | 'wide' | 'full';

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  width?: ContainerWidth;
  children: ReactNode;
};

export function Container({ width = 'wide', className, children, ...props }: ContainerProps) {
  return (
    <div className={cn('al-container', `al-container--${width}`, className)} {...props}>
      {children}
    </div>
  );
}
