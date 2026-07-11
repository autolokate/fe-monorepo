import { usePwaInstall } from '../use-pwa-install';

import './PwaInstallIconButton.css';

type PwaInstallIconButtonProps = {
  className?: string;
};

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4v10m0 0 4-4m-4 4-4-4M5 20h14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Top-right install control — native prompt on Android, iOS guidance on tap. */
export function PwaInstallIconButton({ className }: PwaInstallIconButtonProps) {
  const { canShowInstallControl, openInstallGuidance } = usePwaInstall();

  if (!canShowInstallControl) {
    return null;
  }

  return (
    <button
      type="button"
      className={className ? `pwa-install-icon ${className}` : 'pwa-install-icon'}
      aria-label="Install Autolokate app"
      title="Install app"
      onClick={openInstallGuidance}
    >
      <DownloadIcon />
    </button>
  );
}
