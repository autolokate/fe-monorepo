/**
 * Hermetic Admin UI regression runner (ownership-transfer + garage commercial).
 *
 * Intentionally does NOT load `.env.e2e.local` (unlike `run-playwright.mjs`).
 * Forces a dead API base and strips live Admin e2e credential env vars.
 */
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const liveCredentialKeys = [
  'E2E_ADMIN_ACCESS_TOKEN',
  'E2E_ADMIN_REFRESH_TOKEN',
  'E2E_ADMIN_USER_ID',
  'E2E_ADMIN_EXPIRES_AT',
  'E2E_ADMIN_PHONE',
  'E2E_ADMIN_OTP',
  'E2E_TARGET_PHONE',
  'E2E_SKU_ID',
  'E2E_SKU_CODE',
];

for (const key of liveCredentialKeys) {
  delete process.env[key];
}

Object.assign(process.env, {
  VITE_API_BASE_URL: 'http://127.0.0.1:3971',
  VITE_ENVIRONMENT: 'development',
  VITE_ENABLE_LOGS: 'true',
  E2E_API_BASE_URL: 'http://127.0.0.1:3971',
  E2E_HERMETIC_ADMIN_PORT: process.env.E2E_HERMETIC_ADMIN_PORT ?? '5179',
});

const child = spawn('pnpm', ['exec', 'playwright', 'test', '-c', 'playwright.hermetic.config.ts'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
