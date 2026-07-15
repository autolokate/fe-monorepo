'use client';

import { endpoints } from '@/lib/api/endpoints';
import { ApiService } from '@/services/api.service';
import type { ContactUsPayload, ContactUsResponse } from './types';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/** POST /v1/contact-us — public enquiry form (no auth). */
export async function submitContactUs(payload: ContactUsPayload): Promise<ContactUsResponse> {
  const res = await ApiService.post(endpoints.contact.submit, payload, {
    withAuth: false,
  });
  const data = res.data;

  if (isRecord(data)) {
    return {
      success: data.success !== false,
      message: typeof data.message === 'string' ? data.message : undefined,
    };
  }

  return { success: true };
}
