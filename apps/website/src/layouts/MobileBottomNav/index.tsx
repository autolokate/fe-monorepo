'use client';

import { usePathname, useRouter } from 'next/navigation';
import { AlBottomNav, type AlBottomNavItem } from '@autolokate/ui/bottom-nav';
import { isNavItemActive, primaryNavItems } from '@/layouts/Header/constants';

/**
 * Mobile-only bottom tab bar built on the shared design-system `AlBottomNav`.
 * Surfaces the primary content IA within thumb reach. Hidden from `lg` up,
 * where the top header carries the full nav. The Download App conversion CTA
 * lives in the top bar instead, keeping this row focused on content.
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const items: AlBottomNavItem[] = primaryNavItems.map((item) => {
    const Icon = item.icon;
    return {
      id: item.href,
      label: item.shortLabel ?? item.label,
      icon: Icon ? <Icon size={22} aria-hidden /> : undefined,
      active: isNavItemActive(pathname, item.href),
      onClick: () => router.push(item.href),
    };
  });

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
      <AlBottomNav layout="stacked" items={items} className="w-full" />
    </div>
  );
}
