import { AlScreenSpinner } from '@autolokate/ui';

export type AdminPageLoaderProps = {
  label?: string;
  fullscreen?: boolean;
};

export function AdminPageLoader({ label = 'Loading…', fullscreen = false }: AdminPageLoaderProps) {
  return (
    <div
      className={`admin-page-loader${fullscreen ? ' admin-page-loader--fullscreen' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <AlScreenSpinner size="lg" animated aria-label={label} />
    </div>
  );
}
