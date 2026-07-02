import { useCallback, useState } from 'react';

import { mapProfileApiError } from '@/services/profile/profile-errors.js';
import { saveOwnerName, type SaveOwnerNameInput } from '@/services/profile/profile-service.js';

export function useUpdateProfile() {
  const [isPending, setIsPending] = useState(false);

  const updateProfile = useCallback(async (input: SaveOwnerNameInput) => {
    setIsPending(true);
    try {
      const data = await saveOwnerName(input);
      return { ok: true as const, data };
    } catch (error) {
      return { ok: false as const, error: mapProfileApiError(error) };
    } finally {
      setIsPending(false);
    }
  }, []);

  return { updateProfile, isPending };
}
