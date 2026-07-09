export type PermissionKind = 'camera' | 'location';

export type PermissionRecoveryState = 'prompt' | 'denied' | 'blocked' | 'unknown';

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

export async function queryPermissionState(kind: PermissionKind): Promise<PermissionRecoveryState> {
  if (!('permissions' in navigator) || typeof navigator.permissions.query !== 'function') {
    return 'unknown';
  }

  try {
    const descriptor: PermissionDescriptor =
      kind === 'camera' ? { name: 'camera' } : { name: 'geolocation' };
    const status = await navigator.permissions.query(descriptor);
    if (status.state === 'granted') {
      return 'prompt';
    }
    if (status.state === 'denied') {
      return 'blocked';
    }
    return 'prompt';
  } catch {
    return 'unknown';
  }
}

export function getPermissionSettingsInstructions(kind: PermissionKind): string {
  if (isIos()) {
    return kind === 'camera'
      ? 'Open Settings → Safari → Camera → Allow for this site.'
      : 'Open Settings → Privacy & Security → Location Services → Safari → While Using.';
  }

  if (isAndroid()) {
    return kind === 'camera'
      ? 'Open Chrome → site lock icon → Permissions → Camera → Allow.'
      : 'Open Chrome → site lock icon → Permissions → Location → Allow.';
  }

  return kind === 'camera'
    ? 'Allow camera access in your browser site settings.'
    : 'Allow location access in your browser site settings.';
}

/** Best-effort settings opener — falls back to instructions when OS blocks deep links. */
export function openPermissionSettings(kind: PermissionKind): boolean {
  if (isAndroid()) {
    try {
      const packageName = 'com.android.chrome';
      const intent = `intent://settings#Intent;scheme=android-app;package=${packageName};end`;
      window.location.href = intent;
      return true;
    } catch {
      // fall through
    }
  }

  if (isIos()) {
    try {
      window.location.href = 'app-settings:';
      return true;
    } catch {
      // fall through
    }
  }

  void kind;
  return false;
}

export function isMobileDevice(): boolean {
  return isIos() || isAndroid();
}

export { isAndroid, isIos };
