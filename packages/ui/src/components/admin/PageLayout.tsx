import type { ReactNode } from 'react';

import { cn } from '../../utils/cn.js';
import './PageLayout.css';

export type AlPageLayoutProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  className?: string;
  sidebarClassName?: string;
};

/** Desktop-first admin page shell with optional sidebar and header slots. */
export function AlPageLayout({ children, sidebar, header, className, sidebarClassName }: AlPageLayoutProps) {
  return (
    <div className={cn('al-page-layout', className)}>
      {sidebar ? (
        <aside className={cn('al-page-layout__sidebar', sidebarClassName)}>{sidebar}</aside>
      ) : null}
      <div className="al-page-layout__main">
        {header ? <div className="al-page-layout__header">{header}</div> : null}
        <div className="al-page-layout__content">{children}</div>
      </div>
    </div>
  );
}

export type AlPageContentProps = {
  children: ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl' | 'full';
};

export function AlPageContent({ children, maxWidth = 'xl' }: AlPageContentProps) {
  return (
    <div className={`al-page-content al-page-content--${maxWidth}`}>
      {children}
    </div>
  );
}
