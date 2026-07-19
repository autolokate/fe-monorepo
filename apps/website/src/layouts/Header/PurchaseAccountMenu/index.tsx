'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, LogOut, MapPin, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getJourneyProfile,
  signOutJourney,
} from '@/app/(purchase-journey)/shared/services/auth-api';
import { JOURNEY_ROUTES } from '@/app/(purchase-journey)/shared/routes';

interface PurchaseAccountMenuProps {
  /** Called after the buyer signs out, so the header can flip back to guest. */
  onSignOut?: () => void;
  className?: string;
}

/**
 * Account chip shown in the marketing header when the visitor has a live
 * purchase-journey session (verified via OTP during checkout). Mirrors the
 * `JourneyHeader` member chip — avatar initial + first name + chevron, opening
 * a menu with My orders / My addresses / Log out.
 */
export function PurchaseAccountMenu({ onSignOut, className }: PurchaseAccountMenuProps) {
  const router = useRouter();
  const [name, setName] = useState('');

  useEffect(() => {
    let active = true;
    void getJourneyProfile()
      .then((profile) => {
        if (active) setName(profile.name);
      })
      .catch(() => {
        // Fall back to the neutral "Account" chip on failure.
      });
    return () => {
      active = false;
    };
  }, []);

  const trimmed = name.trim();
  const initial = trimmed ? trimmed.charAt(0).toUpperCase() : 'A';

  const handleLogout = () => {
    // Fire logout (revokes server-side, then clears the local session) while we
    // optimistically flip the header to guest and send the buyer home.
    void signOutJourney();
    onSignOut?.();
    router.push('/');
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            'group inline-flex items-center gap-2.5 text-white outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c] rounded-full',
            className,
          )}
        >
          <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#1fa24a] text-[15px] font-semibold leading-none text-white">
            {initial}
          </span>
          <ChevronDown
            className="h-4 w-4 text-[#9aa0a8] transition-transform group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={12}
          collisionPadding={16}
          className="z-[60] flex w-56 flex-col rounded-2xl border border-black/10 bg-white p-2 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="px-3 py-2">
            <span className="text-[15px] font-semibold leading-tight text-[#0a0a0c]">
              {trimmed || 'Account'}
            </span>
          </div>

          <DropdownMenu.Item asChild className={itemClass}>
            <Link href={JOURNEY_ROUTES.orders}>
              <Package className="h-[18px] w-[18px] shrink-0 text-[#0a0a0c]" aria-hidden />
              My orders
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild className={itemClass}>
            <Link href={JOURNEY_ROUTES.addresses}>
              <MapPin className="h-[18px] w-[18px] shrink-0 text-[#0a0a0c]" aria-hidden />
              My addresses
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1.5 h-px bg-black/[0.08]" />

          <DropdownMenu.Item className={itemClass} onSelect={handleLogout}>
            <LogOut className="h-[18px] w-[18px] shrink-0 text-[#0a0a0c]" aria-hidden />
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

const itemClass =
  'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-[#0a0a0c] no-underline outline-none transition-colors hover:bg-[#e8e8e8] data-[highlighted]:bg-[#e8e8e8]';
