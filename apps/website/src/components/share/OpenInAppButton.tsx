'use client';

import { useCallback } from 'react';

import {
  ANDROID_STORE_URL,
  IOS_STORE_URL,
  androidIntentUrlForReel,
  appSchemeUrlForReel,
} from '@/lib/app-links/config';

/**
 * "Open in app": when the app is installed, the OS normally opens https://autolokate.com/r|c/{id}
 * directly (universal / app links) and this page never shows. It shows inside in-app browsers or
 * when the app is missing — so try the custom scheme (Android: an intent URL with a Play Store
 * fallback; iOS: `autolokate://` then the App Store if the page is still visible).
 */
export function OpenInAppButton({ reelId, className }: { reelId: string; className?: string }) {
  const onClick = useCallback(() => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) {
      window.location.href = androidIntentUrlForReel(reelId);
      return;
    }
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const started = Date.now();
    window.location.href = appSchemeUrlForReel(reelId);
    window.setTimeout(() => {
      if (document.visibilityState === 'visible' && Date.now() - started < 3000) {
        window.location.href = isIos ? IOS_STORE_URL : ANDROID_STORE_URL;
      }
    }, 1500);
  }, [reelId]);

  return (
    <button type="button" onClick={onClick} className={className} data-testid="open-in-app">
      Open in the Autolokate app
    </button>
  );
}
