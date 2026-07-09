import type { PlanTier } from './plan.js';

export type QrSession = {
  plate?: string;
  mobile?: string;
  name?: string;
  plan?: PlanTier;
  riders?: number;
  discount?: number;
};

export type EmergencyContactSearch = {
  contactName?: string;
  contactMobile?: string;
  contactRelationship?: string;
  otherRelationship?: string;
};
