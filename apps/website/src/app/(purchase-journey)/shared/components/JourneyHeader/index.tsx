'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ArrowRight, ChevronDown, LogOut, MapPin, Package } from 'lucide-react';
import { AlMark } from '@/layouts/Header/constants';
import {
  getJourneyProfile,
  isPurchaseAuthenticated,
  signOutJourney,
} from '../../services/auth-api';
import { JOURNEY_ROUTES } from '../../routes';
import styles from './index.module.css';

interface JourneyHeaderProps {
  /**
   * Buyer's display name, shown in the member (logged-in) state. When the buyer
   * is authenticated but no name is known yet, a neutral "Account" chip renders.
   */
  userName?: string;
  /** Destination for the guest "Log in" link. */
  loginHref?: string;
}

/**
 * Purchase-journey top nav (Figma "WebCheckoutNav"). A dark, distraction-free
 * bar with the brand lockup on the left and an auth-aware control on the right:
 *  - guest  → "Already a member? Log in →"
 *  - member → avatar initial + first name + chevron, opening an account menu
 *
 * Auth state is derived from the purchase session on the client. The first
 * paint (server + pre-hydration) always renders the guest state, so there's no
 * hydration mismatch; it flips to member after mount if a session exists. The
 * member's name is read once from `GET /v1/profile` (cached across pages).
 */
export function JourneyHeader({ userName, loginHref = '/login' }: JourneyHeaderProps) {
  const router = useRouter();
  const [isMember, setIsMember] = useState(false);
  const [fetchedName, setFetchedName] = useState('');

  useEffect(() => {
    if (!isPurchaseAuthenticated()) return;
    setIsMember(true);

    // Only fetch when the caller hasn't supplied a name to show.
    if (userName?.trim()) return;
    let active = true;
    void getJourneyProfile()
      .then((profile) => {
        if (active) setFetchedName(profile.name);
      })
      .catch(() => {
        // Fall back to the neutral "Account" chip on failure.
      });
    return () => {
      active = false;
    };
  }, [userName]);

  const name = (userName ?? fetchedName).trim();
  const initial = name ? name.charAt(0).toUpperCase() : 'A';
  const firstName = name ? name.split(' ')[0] : 'Account';

  const handleLogout = () => {
    void signOutJourney();
    setIsMember(false);
    router.push('/');
  };

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Autolokate home">
          <AlMark className={styles.mark} />
          <span className={styles.wordmark}>utolokate</span>
        </Link>

        {isMember ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" className={styles.account}>
                <span className={styles.avatar} aria-hidden>
                  {initial}
                </span>
                <span className={styles.accountName}>{firstName}</span>
                <ChevronDown className={styles.chevron} aria-hidden />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className={styles.menu}
                align="end"
                sideOffset={12}
                collisionPadding={16}
              >
                <div className={styles.menuUser}>
                  <span className={styles.menuName}>{name || 'Account'}</span>
                </div>

                <DropdownMenu.Item asChild className={styles.menuItem}>
                  <Link href={JOURNEY_ROUTES.orders}>
                    <Package className={styles.menuIcon} aria-hidden />
                    My orders
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild className={styles.menuItem}>
                  <Link href={JOURNEY_ROUTES.addresses}>
                    <MapPin className={styles.menuIcon} aria-hidden />
                    My addresses
                  </Link>
                </DropdownMenu.Item>

                <div className={styles.menuSpacer} />

                <DropdownMenu.Item className={styles.menuItem} onSelect={handleLogout}>
                  <LogOut className={styles.menuIcon} aria-hidden />
                  Log out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <Link href={loginHref} className={styles.loginLink}>
            <span className={styles.loginHint}>Already a member?</span>
            <span className={styles.loginCta}>Log in</span>
            <ArrowRight className={styles.loginArrow} aria-hidden />
          </Link>
        )}
      </div>
    </header>
  );
}
