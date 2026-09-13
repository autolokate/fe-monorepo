/** Marker export for the @autolokate/config workspace package. */
export const name = '@autolokate/config' as const;

export {
  PRODUCTION_API_BASE_URL,
  STAGING_API_BASE_URL,
  isLoopbackApiUrl,
  resolveApiBaseUrl,
} from './api-base-url';
