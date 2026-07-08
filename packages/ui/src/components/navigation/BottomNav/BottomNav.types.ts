import type { HTMLAttributes, ReactNode } from 'react';

export type AlBottomNavItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
};

/**
 * Controls how each item's icon and label are arranged.
 * - `inline` (default): icon and label sit side by side; inactive items show
 *   icon only and the active item expands into a labelled chip.
 * - `stacked`: icon on top with the label beneath it, shown for every item.
 */
export type AlBottomNavLayout = 'inline' | 'stacked';

export type AlBottomNavProps = HTMLAttributes<HTMLElement> & {
  items: AlBottomNavItem[];
  layout?: AlBottomNavLayout;
};
