export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (/\bMac\b/.test(ua) && navigator.maxTouchPoints > 1)
  );
}

export function isIosSafari(): boolean {
  if (!isIosDevice()) {
    return false;
  }
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}

/** iOS Chrome, Edge, Firefox, etc. — WebKit wrapper without native install prompt. */
export function isIosNonSafariBrowser(): boolean {
  if (!isIosDevice()) {
    return false;
  }
  return !isIosSafari();
}

export function isIosChrome(): boolean {
  return isIosDevice() && /CriOS/.test(navigator.userAgent);
}

export function isIosEdge(): boolean {
  return isIosDevice() && /EdgiOS/.test(navigator.userAgent);
}

export function getIosBrowserLabel(): 'safari' | 'chrome' | 'edge' | 'other' {
  if (!isIosDevice()) {
    return 'other';
  }
  if (isIosSafari()) {
    return 'safari';
  }
  if (isIosChrome()) {
    return 'chrome';
  }
  if (isIosEdge()) {
    return 'edge';
  }
  return 'other';
}

export function isAndroidDevice(): boolean {
  return /Android/.test(navigator.userAgent);
}

export function isStandaloneDisplay(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}
