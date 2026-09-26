/** Pixel viewport height for Android WebView, where 100vh/100dvh can resolve to 0. */
export function installAppHeight(): void {
  const root = document.documentElement;

  const apply = () => {
    const viewportHeight = window.visualViewport?.height;
    const height = Math.round(viewportHeight ?? window.innerHeight);
    if (height > 0) {
      root.style.setProperty('--al-app-height', `${String(height)}px`);
    }
  };

  apply();
  window.addEventListener('resize', apply);
  window.visualViewport?.addEventListener('resize', apply);
  window.visualViewport?.addEventListener('scroll', apply);
}

type NativeWindow = Window & {
  QrLocation?: unknown;
  webkit?: { messageHandlers?: { qrLocation?: unknown } };
};

export function markNativeEmbed(): void {
  const nativeWindow = window as NativeWindow;
  const native = Boolean(
    nativeWindow.QrLocation || nativeWindow.webkit?.messageHandlers?.qrLocation,
  );
  if (!native) return;
  document.documentElement.classList.add('al-native-embed');
  try {
    window.localStorage.setItem('al-qr-theme', 'light');
  } catch {
    // private browsing
  }
  document.documentElement.setAttribute('data-theme', 'light');
}
