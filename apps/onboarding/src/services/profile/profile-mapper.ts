import type { Profile } from '@autolokate/api-client';

export type ProfileJourneyPatch = {
  ownerName?: string;
  languageId?: 'en' | 'hi';
};

/** Map backend profile DTO into existing JourneySession auth fields. */
export function mapProfileToJourney(profile: Profile | null): ProfileJourneyPatch {
  if (!profile) {
    return {};
  }

  const patch: ProfileJourneyPatch = {};

  if (profile.name?.trim()) {
    patch.ownerName = profile.name.trim();
  }

  if (profile.locale.toLowerCase().startsWith('hi')) {
    patch.languageId = 'hi';
  } else if (profile.locale) {
    patch.languageId = 'en';
  }

  return patch;
}
