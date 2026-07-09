export type AppEnvironment = 'development' | 'production' | 'staging';

export type AppEnv = {
  apiBaseUrl: string;
  environment: AppEnvironment;
  enableLogs: boolean;
};

type EnvKey = 'VITE_API_BASE_URL' | 'VITE_ENVIRONMENT' | 'VITE_ENABLE_LOGS';

function readRaw(key: EnvKey): string | undefined {
  const envRecord = import.meta.env as Record<string, string | boolean | undefined>;
  const value = envRecord[key];
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
  // Fail fast in every mode rather than baking a fallback URL into the bundle. Local dev supplies this
  // via .env.development (copy .env.example); staging/prod builds inject it at build time (CI).
  throw new Error(
    '[admin] Missing required environment variable: VITE_API_BASE_URL. Copy apps/admin/.env.example to .env.development',
  );
}

function parseEnvironment(value: string | undefined): AppEnvironment {
  if (value === 'production' || value === 'staging' || value === 'development') {
    return value;
  }
  return import.meta.env.PROD ? 'production' : 'development';
}

export const env: AppEnv = Object.freeze({
  apiBaseUrl: resolveApiBaseUrl(),
  environment: parseEnvironment(readRaw('VITE_ENVIRONMENT')),
  enableLogs: readRaw('VITE_ENABLE_LOGS') === 'true',
});

export function validateEnv(): AppEnv {
  return env;
}
