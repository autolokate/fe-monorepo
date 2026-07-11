import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const E2E = path.dirname(fileURLToPath(import.meta.url));
const QR = path.resolve(E2E, '..');
const PKGS = path.resolve(QR, '../../packages');
const FAKE = path.join(E2E, 'fake-firebase');

/**
 * The QR app served with `firebase/*` (and the VitePWA `virtual:pwa-register/react` module) swapped
 * for controllable fakes. Everything else — the real firebase-messaging.ts bridge, device-service,
 * api-client, auth — is untouched, so the FID's arrival time relative to the bounded wait becomes a
 * test input. Firebase config is required-non-null (values are irrelevant; the SDK is faked).
 *
 * The app's workspace-package aliases are replicated from ../vite.config.ts so the module graph
 * matches the real dev server. VitePWA itself is omitted — its only runtime import is the fake above.
 *
 * `envDir` points here (no `.env*` files) so the harness stays hermetic: env comes solely from the
 * VITE_-prefixed `process.env` the runner sets, never from a developer's local apps/qr/.env.development.
 */
export default defineConfig({
  root: QR,
  envDir: E2E,
  clearScreen: false,
  logLevel: 'warn',
  server: { host: '127.0.0.1', port: 5200, strictPort: false },
  optimizeDeps: { exclude: ['firebase', 'firebase/app', 'firebase/messaging'] },
  resolve: {
    alias: [
      { find: /^firebase\/app$/, replacement: path.join(FAKE, 'app.js') },
      { find: /^firebase\/messaging$/, replacement: path.join(FAKE, 'messaging.js') },
      { find: 'virtual:pwa-register/react', replacement: path.join(FAKE, 'pwa-register-react.js') },
      { find: '@autolokate/brand', replacement: path.join(PKGS, 'brand/src') },
      { find: '@autolokate/ui', replacement: path.join(PKGS, 'ui/src') },
      { find: '@autolokate/design-system', replacement: path.join(PKGS, 'design-system/src') },
      { find: '@autolokate/icons', replacement: path.join(PKGS, 'icons/src') },
      { find: '@autolokate/types', replacement: path.join(PKGS, 'types/src') },
      { find: '@autolokate/utils', replacement: path.join(PKGS, 'utils/src') },
      { find: '@', replacement: path.join(QR, 'src') },
    ],
  },
  plugins: [react()],
});
