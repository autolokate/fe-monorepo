import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@autolokate/brand': path.resolve(rootDir, '../../packages/brand/src'),
      '@autolokate/ui': path.resolve(rootDir, '../../packages/ui/src'),
      '@autolokate/design-system': path.resolve(rootDir, '../../packages/design-system/src'),
      '@autolokate/icons': path.resolve(rootDir, '../../packages/icons/src'),
      '@autolokate/utils': path.resolve(rootDir, '../../packages/utils/src'),
    },
  },
});
