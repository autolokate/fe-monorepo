import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/cn';
import './Heading.css';

export type AlHeadingVariant = 'h1' | 'h2' | 'h3' | 'h4';

export type AlHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: AlHeadingVariant;
  variant?: AlHeadingVariant;
  children: ReactNode;
};

export function AlHeading({ as, variant = 'h2', className, children, ...props }: AlHeadingProps) {
  const Tag = as ?? variant;
  return (
    <Tag className={cn('al-heading', `al-heading--${variant}`, className)} {...props}>
      {children}
    </Tag>
  );
}
