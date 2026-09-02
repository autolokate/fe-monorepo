import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Bind the loopback IP directly: some managed hosts (e.g. FortiClient ZTNA)
  // rewrite /etc/hosts and drop the `localhost` entry, which makes Vite's
  // default `localhost` bind fail with `getaddrinfo ENOTFOUND localhost`.
  server: {
    host: '127.0.0.1',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.ico',
        'favicon-16.png',
        'favicon-32.png',
        'apple-touch-icon.png',
        'offline.html',
        'manifest.webmanifest',
        'brand/al-logo-dark.svg',
        'brand/al-logo-light.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-192-maskable.png',
        'icons/icon-512-maskable.png',
        // Dedicated FCM SW (separate scope); must stay at site root for getToken().
        'firebase-messaging-sw.js',
      ],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,webmanifest,svg,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'al-html-shell',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 8,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'al-images',
              expiration: {
                maxEntries: 48,
                maxAgeSeconds: 60 * 60 * 24 * 14,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@autolokate/brand': path.resolve(rootDir, '../../packages/brand/src'),
      '@autolokate/ui': path.resolve(rootDir, '../../packages/ui/src'),
      '@autolokate/design-system': path.resolve(rootDir, '../../packages/design-system/src'),
      '@autolokate/icons': path.resolve(rootDir, '../../packages/icons/src'),
      '@autolokate/types': path.resolve(rootDir, '../../packages/types/src'),
      '@autolokate/utils': path.resolve(rootDir, '../../packages/utils/src'),
    },
  },
});
