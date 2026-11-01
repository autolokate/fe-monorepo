/** Mirrors the Nest `UpdateProfileDto.name` rule (`@Length(1, 100)`). */
export const PROFILE_NAME_MAX = 100;

/** Client-side validation for the profile name. Returns an error message or `null`. */
export function validateProfileName(raw: string): string | null {
  const name = raw.trim();
  if (!name) return 'Please enter your name.';
  if (name.length < 2) return 'Name must be at least 2 characters.';
  if (name.length > PROFILE_NAME_MAX) {
    return `Name must be at most ${String(PROFILE_NAME_MAX)} characters.`;
  }
  return null;
}
