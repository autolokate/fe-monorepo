type NativeWindow = Window & {
  QrLocation?: unknown;
  webkit?: { messageHandlers?: { qrLocation?: unknown } };
};

/** True when the QR app is hosted inside the AutoLokate native WebView. */
export function isNativeEmbed(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  const root = document.documentElement;
  if (root.classList.contains('al-native-embed')) {
    return true;
  }
  const nativeWindow = window as NativeWindow;
  if (nativeWindow.QrLocation || nativeWindow.webkit?.messageHandlers?.qrLocation) {
    return true;
  }
  return /AutolokateNative/i.test(navigator.userAgent || '');
}
