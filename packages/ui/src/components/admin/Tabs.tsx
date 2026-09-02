import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';
import './Tabs.css';

export type AlTabItem = {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

export type AlTabsProps = {
  items: AlTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel?: string;
};

export function AlTabs({ items, value, onValueChange, ariaLabel }: AlTabsProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange} className="al-tabs">
      <TabsPrimitive.List className="al-tabs__list" aria-label={ariaLabel}>
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.id}
            value={item.id}
            disabled={item.disabled}
            className={cn('al-tabs__trigger', 'al-admin-focus-ring')}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content key={item.id} value={item.id} className="al-tabs__content">
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
