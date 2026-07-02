export type AppEnvironment = 'development' | 'production' | 'staging';

export type AppEnv = {
  apiBaseUrl: string;
  environment: AppEnvironment;
  enableLogs: boolean;
  razorpayKey: string | null;
};

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

function requireEnv(key: 'VITE_API_BASE_URL'): string {
  const value = readRaw(key);
  if (!value) {
    throw new Error(
      `[onboarding] Missing required environment variable: ${key}. See apps/onboarding/.env.example`,
    );
  }
  return value;
}

function parseEnvironment(value: string | undefined): AppEnvironment {
  if (value === 'production' || value === 'staging' || value === 'development') {
    return value;
  }
  return import.meta.env.PROD ? 'production' : 'development';
}

/** Validated, typed environment — the only module that reads `import.meta.env`. */
export const env: AppEnv = Object.freeze({
  apiBaseUrl: requireEnv('VITE_API_BASE_URL'),
  environment: parseEnvironment(readRaw('VITE_ENVIRONMENT')),
  enableLogs: readRaw('VITE_ENABLE_LOGS') === 'true',
  razorpayKey: readRaw('VITE_RAZORPAY_KEY') ?? null,
});

/** Call once at startup to fail fast on missing configuration. */
export function validateEnv(): AppEnv {
  return env;
}
