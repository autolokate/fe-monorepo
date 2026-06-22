export type AuthUser = {
  id?: string;
  full_name?: string | null;
  phone?: string | null;
  city_id?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  preferred_fuel_types?: string[] | null;
  preferred_body_types?: string[] | null;
  preferred_vehicle_category?: string | null;
  consented_at?: string | null;
  consent_version?: string | null;
  is_pending_deletion?: boolean;
  deletion_scheduled_at?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export interface RequestOtpPayload {
  phone: string;
}

export interface RequestOtpResponse {
  sent: boolean;
  expires_in: number;
  message?: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
  consent_accepted: boolean;
  consent_version: string;
  full_name?: string;
}

export interface VerifyOtpResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  is_new_user: boolean;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
  user?: AuthUser;
}

/** Body for `PATCH /v1/auth/me`. All keys optional — only changed fields are sent. */
export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string;
  city_id?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  preferred_fuel_types?: string[] | null;
  preferred_body_types?: string[] | null;
  preferred_vehicle_category?: string | null;
}

/** Generic backend envelope: `{ success, data }`. Used as a fallback shape. */
export type ApiEnvelope<T> =
  | T
  | {
      success?: boolean;
      data?: T;
    };
