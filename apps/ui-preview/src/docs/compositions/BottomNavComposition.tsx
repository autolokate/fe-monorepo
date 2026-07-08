import { AlIcon } from '@autolokate/icons';
import { AlBottomNav, AlStack, AlText } from '@autolokate/ui';

const navItems = [
  { id: 'home', label: 'Home', icon: 'house' },
  { id: 'services', label: 'Services', icon: 'store' },
  { id: 'community', label: 'Community', icon: 'users' },
  { id: 'profile', label: 'Profile', icon: 'circle-user' },
] as const;

export function BottomNavComposition() {
  return (
    <AlStack gap="lg">
      {navItems.map((activeItem) => (
        <AlStack key={activeItem.id} gap="sm">
          <AlText variant="caption" tone="muted">
            Active: {activeItem.label}
          </AlText>
          <AlBottomNav
            items={navItems.map((item) => ({
              id: item.id,
              label: item.label,
              active: item.id === activeItem.id,
              icon: <AlIcon name={item.icon} size={20} aria-hidden />,
            }))}
          />
        </AlStack>
      ))}
      <AlStack gap="sm">
        <AlText variant="caption" tone="muted">
          Stacked layout — icon on top, label beneath
        </AlText>
        <AlBottomNav
          layout="stacked"
          items={navItems.map((item) => ({
            id: item.id,
            label: item.label,
            active: item.id === navItems[0].id,
            icon: <AlIcon name={item.icon} size={20} aria-hidden />,
          }))}
        />
      </AlStack>
    </AlStack>
  );
}
