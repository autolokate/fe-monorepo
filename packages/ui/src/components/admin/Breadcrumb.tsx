import { cn } from '../../utils/cn.js';
import './Breadcrumb.css';

export type AlBreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  current?: boolean;
};

export type AlBreadcrumbProps = {
  items: AlBreadcrumbItem[];
};

export function AlBreadcrumb({ items }: AlBreadcrumbProps) {
  return (
    <nav className="al-breadcrumb" aria-label="Breadcrumb">
      <ol className="al-breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.current;
          return (
            <li key={`${item.label}-${String(index)}`} className="al-breadcrumb__item">
              {isLast ? (
                <span className="al-breadcrumb__current" aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <a className="al-breadcrumb__link al-admin-focus-ring" href={item.href}>
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  className={cn('al-breadcrumb__link', 'al-admin-focus-ring')}
                  onClick={item.onClick}
                >
                  {item.label}
                </button>
              )}
              {!isLast ? (
                <span className="al-breadcrumb__separator" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
