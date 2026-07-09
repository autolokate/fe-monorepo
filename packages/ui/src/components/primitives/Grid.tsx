import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/cn';
import type { StackGap } from './Stack';
import './Grid.css';

export type GridColumns = 1 | 2 | 3 | 4 | 'auto';

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  columns?: GridColumns;
  gap?: StackGap;
  children: ReactNode;
};

export function Grid({ columns = 1, gap = 'md', className, children, ...props }: GridProps) {
  const columnsClass = columns === 'auto' ? 'al-grid--cols-auto' : `al-grid--cols-${String(columns)}`;

  return (
    <div className={cn('al-grid', columnsClass, `al-grid--gap-${gap}`, className)} {...props}>
      {children}
    </div>
  );
}
