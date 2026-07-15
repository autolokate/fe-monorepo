/**
 * Client-side rules for `POST /v1/contact-us` (ContactUsDto).
 */

import type { ContactUsPayload } from '@/services/contact/types';

export const MAX_CONTACT_NAME = 200;
export const MAX_CONTACT_MESSAGE = 5000;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 10-digit local, +91XXXXXXXXXX, or 91-XXXXXXXXXX / 91XXXXXXXXXX */
const INDIAN_MOBILE_INPUT = /^(?:\+91[6-9]\d{9}|91[- ]?[6-9]\d{9}|[6-9]\d{9})$/;

export type ContactFormFields = {
  name: string;
  number: string;
  email: string;
  message: string;
};

export function isValidIndianMobile(raw: string): boolean {
  const compact = raw.trim().replace(/\s/g, '');
  return INDIAN_MOBILE_INPUT.test(compact);
}

/** Normalise accepted Indian formats to E.164 (+91XXXXXXXXXX) for the API. */
export function normalizeIndianMobile(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return raw.trim().replace(/\s/g, '');
}

/** Returns the first validation error message, or `null` when the form is valid. */
export function validateContactForm(fields: ContactFormFields): string | null {
  const name = fields.name.trim();
  if (!name) return 'Please enter your name.';
  if (name.length > MAX_CONTACT_NAME) {
    return `Name must be at most ${MAX_CONTACT_NAME} characters.`;
  }

  const numberRaw = fields.number.trim();
  if (!numberRaw) return 'Please enter your mobile number.';
  if (!isValidIndianMobile(numberRaw)) {
    return 'Use a valid Indian mobile: 9812345678, +919812345678, or 91-9812345678.';
  }

  const email = fields.email.trim();
  if (!email) return 'Please enter your email address.';
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address.';

  const message = fields.message.trim();
  if (!message) return 'Please enter your message.';
  if (message.length > MAX_CONTACT_MESSAGE) {
    return `Message must be at most ${MAX_CONTACT_MESSAGE} characters.`;
  }

  return null;
}

/** Validates and builds the API payload. Returns `null` when validation fails. */
export function buildContactUsPayload(fields: ContactFormFields): ContactUsPayload | null {
  const error = validateContactForm(fields);
  if (error) return null;

  return {
    name: fields.name.trim(),
    number: normalizeIndianMobile(fields.number),
    email: fields.email.trim(),
    message: fields.message.trim(),
  };
}
