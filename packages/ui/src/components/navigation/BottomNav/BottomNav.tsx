import { cn } from '../../../utils/cn';

import type { AlBottomNavProps } from './BottomNav.types';
import './BottomNav.css';

export function AlBottomNav({ items, className, layout = 'inline', ...props }: AlBottomNavProps) {
  const isStacked = layout === 'stacked';

  return (
    <nav
      className={cn('al-bottom-nav', `al-bottom-nav--${layout}`, className)}
      aria-label="Bottom navigation"
      {...props}
    >
      {items.map((item) => {
        const showLabel = isStacked || item.active;

        return (
          <button
            key={item.id}
            type="button"
            className={cn('al-bottom-nav__item', item.active && 'al-bottom-nav__item--active')}
            aria-current={item.active ? 'page' : undefined}
            aria-label={showLabel ? undefined : item.label}
            onClick={item.onClick}
          >
            {item.icon ? <span className="al-bottom-nav__icon">{item.icon}</span> : null}
            {showLabel ? <span className="al-bottom-nav__label">{item.label}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
