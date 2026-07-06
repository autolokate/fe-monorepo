export type AppEnvironment = 'development' | 'production' | 'staging';

export type AppEnv = {
  apiBaseUrl: string;
  environment: AppEnvironment;
  enableLogs: boolean;
  razorpayKey: string | null;
};

/** Consumer onboarding API (auth, QR, legal, checkout) — NOT the website catalog API. */
const DEFAULT_ONBOARDING_API_BASE_URL =
  'https://malisa-noninclusive-davin.ngrok-free.dev';

type EnvKey =
  | 'VITE_API_BASE_URL'
  | 'VITE_ENVIRONMENT'
  | 'VITE_ENABLE_LOGS'
  | 'VITE_RAZORPAY_KEY';

function readRaw(key: EnvKey): string | undefined {
  const value: string | undefined = import.meta.env[key];
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function resolveApiBaseUrl(): string {
  const value = readRaw('VITE_API_BASE_URL');
  if (value) {
    return value;
  }
  if (import.meta.env.PROD) {
    return DEFAULT_ONBOARDING_API_BASE_URL;
  }
  throw new Error(
    '[onboarding] Missing required environment variable: VITE_API_BASE_URL. Copy apps/onboarding/.env.example to .env.development',
  );
}

function parseEnvironment(value: string | undefined): AppEnvironment {
  if (value === 'production' || value === 'staging' || value === 'development') {
    return value;
  }
  return import.meta.env.PROD ? 'production' : 'development';
}

/** Validated, typed environment — the only module that reads `import.meta.env`. */
export const env: AppEnv = Object.freeze({
  apiBaseUrl: resolveApiBaseUrl(),
  environment: parseEnvironment(readRaw('VITE_ENVIRONMENT')),
  enableLogs: readRaw('VITE_ENABLE_LOGS') === 'true',
  razorpayKey: readRaw('VITE_RAZORPAY_KEY') ?? null,
});

/** Call once at startup to fail fast on missing configuration. */
export function validateEnv(): AppEnv {
  return env;
}
