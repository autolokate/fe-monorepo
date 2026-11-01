/**
 * Read (never verify) the claims of the admin access JWT. Used only to decide which screen to show
 * — the server remains the sole authority (`AdminPlaneGuard` checks `step_up` on every call).
 */
export type AccessTokenClaims = {
  role: string | null;
  stepUp: boolean | null;
};

function decodeBase64Url(segment: string): string | null {
  try {
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/** `null` when the token is not a decodable JWT (opaque tokens defer entirely to the server). */
export function readAccessTokenClaims(
  accessToken: string | null | undefined,
): AccessTokenClaims | null {
  if (!accessToken) {
    return null;
  }
  const parts = accessToken.split('.');
  if (parts.length !== 3 || !parts[1]) {
    return null;
  }
  const json = decodeBase64Url(parts[1]);
  if (!json) {
    return null;
  }
  try {
    const payload = JSON.parse(json) as Record<string, unknown>;
    return {
      role: typeof payload['role'] === 'string' ? payload['role'] : null,
      stepUp: typeof payload['step_up'] === 'boolean' ? payload['step_up'] : null,
    };
  } catch {
    return null;
  }
}

/**
 * True only when the token is a JWT that explicitly carries `step_up: false`. Unknown → false, so
 * the UI never blocks on a guess; a server 403 `step_up_required` re-prompts instead.
 */
export function accessTokenLacksStepUp(accessToken: string | null | undefined): boolean {
  return readAccessTokenClaims(accessToken)?.stepUp === false;
}
