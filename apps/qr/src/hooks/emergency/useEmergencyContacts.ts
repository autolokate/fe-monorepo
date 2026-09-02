import { useCallback, useState } from 'react';

import type { EmergencyContact } from '@/features/emergency/types';
import {
  createEmergencyContact,
  deleteEmergencyContact,
  getEmergencyContactsRevision,
  loadEmergencyContacts,
  peekStoredEmergencyContacts,
  requestEmergencyContactOtp,
  verifyEmergencyContactOtp,
  type EmergencyContactCreateResult,
  type EmergencyContactDeleteResult,
  type EmergencyContactListResult,
  type EmergencyContactOtpResult,
  type EmergencyContactVerifyResult,
} from '@/services/emergency/emergency-contact-service';

export function useEmergencyContacts() {
  const [revision, setRevision] = useState(() => getEmergencyContactsRevision());

  const refresh = useCallback(async (force = false): Promise<EmergencyContactListResult> => {
    const result = await loadEmergencyContacts({ force });
    if (result.ok) {
      setRevision(result.revision);
    }
    return result;
  }, []);

  const requestOtp = useCallback(
    async (mobileDigits: string): Promise<EmergencyContactOtpResult> => {
      return requestEmergencyContactOtp(mobileDigits);
    },
    [],
  );

  const verifyOtp = useCallback(
    async (mobileDigits: string, code: string): Promise<EmergencyContactVerifyResult> => {
      return verifyEmergencyContactOtp(mobileDigits, code);
    },
    [],
  );

  const createContact = useCallback(
    async (
      name: string,
      relation: EmergencyContact['relation'],
    ): Promise<EmergencyContactCreateResult> => {
      const result = await createEmergencyContact(name, relation);
      if (result.ok) {
        setRevision(result.revision);
      }
      return result;
    },
    [],
  );

  const removeContact = useCallback(
    async (contactId: string): Promise<EmergencyContactDeleteResult> => {
      const result = await deleteEmergencyContact(contactId);
      if (result.ok) {
        setRevision(result.revision);
      }
      return result;
    },
    [],
  );

  return {
    contacts: peekStoredEmergencyContacts(),
    revision,
    refresh,
    requestOtp,
    verifyOtp,
    createContact,
    removeContact,
  };
}
