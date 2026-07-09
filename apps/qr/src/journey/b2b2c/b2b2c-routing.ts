import { journeyPaths } from '../constants.js';

export const b2b2cJourneyPaths = {
  welcome: `${journeyPaths.b2b2c}/welcome`,
  welcomePlanRider: `${journeyPaths.b2b2c}/welcome/plan-rider`,
} as const;
