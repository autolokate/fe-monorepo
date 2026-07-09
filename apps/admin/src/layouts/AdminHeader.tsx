import { AlButton, AlIconButton } from '@autolokate/ui';

import { AdminActivityNotification } from '@/platform/components/AdminActivityNotification';
import { ThemeToggleButton } from '@/platform/theme/ThemeToggleButton';
import { useAdminAuth } from '@/providers/AdminAuthProvider';

export type AdminHeaderProps = {
  onOpenCommandPalette: () => void;
  onOpenMobileNav: () => void;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function AdminHeader({ onOpenCommandPalette, onOpenMobileNav }: AdminHeaderProps) {
  const { profile, session, signOut } = useAdminAuth();

  return (
    <header className="admin-shell-header">
      <div className="admin-shell-header__leading">
        <AlIconButton
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          label="Open navigation"
          className="admin-shell-mobile-nav"
          size="sm"
          onClick={onOpenMobileNav}
        />
      </div>
      <div className="admin-shell-header__actions">
        <AlButton
          variant="secondary"
          size="sm"
          className="admin-command-trigger al-admin-focus-ring"
          onClick={onOpenCommandPalette}
        >
          <span className="admin-command-trigger__label">Jump to…</span>
          <span className="admin-command-trigger__kbd">⌘K</span>
        </AlButton>
        <ThemeToggleButton />
        <AdminActivityNotification />
        {profile?.name ? (
          <div className="admin-shell-profile" title={session?.role ? `Role: ${session.role}` : undefined}>
            <span className="admin-shell-profile__avatar" aria-hidden>
              {getInitials(profile.name)}
            </span>
            <span className="admin-shell-profile__name">{profile.name}</span>
          </div>
        ) : null}
        <AlButton variant="secondary" size="sm" onClick={signOut}>
          Sign out
        </AlButton>
      </div>
    </header>
  );
}
