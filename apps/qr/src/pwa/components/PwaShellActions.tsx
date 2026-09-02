import { ThemeToggleButton } from '@/platform/theme/ThemeToggleButton';

import { PwaInstallIconButton } from './PwaInstallIconButton';

import './PwaShellActions.css';

/** Fixed top-right controls — theme override and PWA install. */
export function PwaShellActions() {
  return (
    <div className="pwa-shell-actions" aria-label="App actions">
      <ThemeToggleButton />
      <PwaInstallIconButton />
    </div>
  );
}
