export type AppEnvironment = 'development' | 'production' | 'staging';

export type AppEnv = {
  apiBaseUrl: string;
  environment: AppEnvironment;
  enableLogs: boolean;
  razorpayKey: string | null;
  qrEntryBaseUrl: string;
};

type EnvKey =
  | 'VITE_API_BASE_URL'
  | 'VITE_ENVIRONMENT'
  | 'VITE_ENABLE_LOGS'
  | 'VITE_RAZORPAY_KEY'
  | 'VITE_QR_ENTRY_BASE_URL';

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
  // Fail fast in every mode rather than baking a fallback URL into the bundle. Local dev supplies this
  // via .env.development (copy .env.example); staging/prod builds inject it at build time (CI).
  throw new Error(
    '[qr] Missing required environment variable: VITE_API_BASE_URL. Copy apps/qr/.env.example to .env.development',
  );
}

/**
 * Base host for QR-sticker entry links (`buildQrAuthMobileUrl`). These point back into THIS app, so the
 * base is its own deployed origin — which is already correct per environment (qr-staging.<apex> in
 * staging, qr.<apex> in prod). VITE_QR_ENTRY_BASE_URL overrides it when links must embed a fixed
 * canonical host regardless of where they're generated.
 */
function resolveQrEntryBaseUrl(): string {
  const value = readRaw('VITE_QR_ENTRY_BASE_URL');
  if (value) {
    return value;
  }
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
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
  qrEntryBaseUrl: resolveQrEntryBaseUrl(),
});

/** Call once at startup to fail fast on missing configuration. */
export function validateEnv(): AppEnv {
  return env;
}
