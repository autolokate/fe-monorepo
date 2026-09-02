import { updateProfile as updateProfileApi, type Profile } from '@autolokate/api-client';

import { getQrApiClient } from '@/platform/api/qr-api-client';

import { mapProfileToJourney, type ProfileJourneyPatch } from './profile-mapper';
import { profileLogger } from './profile-logger';

export type SaveOwnerNameInput = {
  name: string;
};

export type SaveOwnerNameResult = {
  profile: Profile;
  journeyPatch: ProfileJourneyPatch;
};

/** PATCH /v1/profile with the owner display name. */
export async function saveOwnerName(input: SaveOwnerNameInput): Promise<SaveOwnerNameResult> {
  const trimmed = input.name.trim();
  const client = getQrApiClient();
  const profile = await updateProfileApi(client, { name: trimmed });
  profileLogger.info('profile_name_saved', { hasName: Boolean(profile.name) });
  return {
    profile,
    journeyPatch: mapProfileToJourney(profile),
  };
}
