import { isNativeEmbed } from './is-native-embed';

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

/** Lock the QR shell to the native AutoLokate light canvas when embedded. */
export function markNativeEmbed(): void {
  if (!isNativeEmbed()) return;
  const root = document.documentElement;
  root.classList.add('al-native-embed');
  try {
    window.localStorage.setItem('al-qr-theme', 'light');
  } catch {
    // private browsing
  }
  root.setAttribute('data-theme', 'light');
}
