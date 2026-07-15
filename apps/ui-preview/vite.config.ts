import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Bind the loopback IP directly: some managed hosts (e.g. FortiClient ZTNA)
  // rewrite /etc/hosts and drop the `localhost` entry, which makes Vite's
  // default `localhost` bind fail with `getaddrinfo ENOTFOUND localhost`.
  server: {
    host: '127.0.0.1',
  },
  resolve: {
    alias: {
      '@autolokate/brand': path.resolve(rootDir, '../../packages/brand/src'),
      '@autolokate/ui': path.resolve(rootDir, '../../packages/ui/src'),
      '@autolokate/design-system': path.resolve(rootDir, '../../packages/design-system/src'),
      '@autolokate/icons': path.resolve(rootDir, '../../packages/icons/src'),
      '@autolokate/icons/common': path.resolve(rootDir, '../../packages/icons/src/common/index.ts'),
      '@autolokate/icons/vehicle': path.resolve(
        rootDir,
        '../../packages/icons/src/vehicle/index.ts',
      ),
      '@autolokate/icons/safety': path.resolve(rootDir, '../../packages/icons/src/safety/index.ts'),
      '@autolokate/icons/qr': path.resolve(rootDir, '../../packages/icons/src/qr/index.ts'),
      '@autolokate/icons/utility': path.resolve(
        rootDir,
        '../../packages/icons/src/utility/index.ts',
      ),
      '@autolokate/icons/partner': path.resolve(
        rootDir,
        '../../packages/icons/src/partner/index.ts',
      ),
      '@autolokate/types': path.resolve(rootDir, '../../packages/types/src'),
      '@autolokate/utils': path.resolve(rootDir, '../../packages/utils/src'),
    },
  },
});
