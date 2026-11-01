'use client';

/**
 * Buyer profile (WEB-04): `GET /v1/profiles` + `PATCH /v1/profile` through the shared
 * api-client. Re-exported from the account auth service so both surfaces use one path.
 */
export {
  fetchProfile as getProfile,
  updateProfile,
  type Profile,
  type UpdateProfilePayload,
} from '@/services/auth';
