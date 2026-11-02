import type { AdminExpertDto, AdminExpertStatus } from '@autolokate/api-client';

export type ExpertForm = {
  id: string;
  name: string;
  designation: string;
  bio: string;
  expertise: string;
  channelUrl: string;
  rating: string;
  sessionsCompleted: string;
  photoAsset: string;
  status: AdminExpertStatus;
};

export const EMPTY_EXPERT_FORM: ExpertForm = {
  id: '',
  name: '',
  designation: '',
  bio: '',
  expertise: '',
  channelUrl: '',
  rating: '',
  sessionsCompleted: '',
  photoAsset: '',
  status: 'ACTIVE',
};

/** The stored profile → form fields, so a save round-trips every column the PUT replaces. */
export function expertToForm(expert: AdminExpertDto): ExpertForm {
  return {
    id: expert.id,
    name: expert.name,
    designation: expert.designation,
    bio: expert.bio,
    expertise: expert.expertise.join(', '),
    channelUrl: expert.channelUrl ?? '',
    rating: expert.rating === null ? '' : String(expert.rating),
    sessionsCompleted: String(expert.sessionsCompleted),
    photoAsset: expert.photoAsset ?? '',
    status: expert.status,
  };
}
