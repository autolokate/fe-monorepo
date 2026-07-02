import type { AlVehicleRcField } from '@autolokate/ui';

export type PwaFlowIntent = 'park-me' | 'sos' | null;

export type PwaScannedVehicle = {
  plate: string;
  modelSummary: string;
  protected: boolean;
  planLabel?: string;
  fields: AlVehicleRcField[];
};

export type PwaGeoPoint = {
  lat: number;
  lng: number;
};

export type PwaParkMePhotos = {
  front: string | null;
  rear: string | null;
};

export type PwaParkMePhotoIds = {
  front: string | null;
  rear: string | null;
};

export type PwaSosPhotos = {
  front: string | null;
  rear: string | null;
  left: string | null;
  right: string | null;
};

export type PwaSosPhotoIds = {
  front: string | null;
  rear: string | null;
  left: string | null;
  right: string | null;
};

export type PwaParkMeStatus = 'idle' | 'checking' | 'calling' | 'resolved' | 'photo-error';

export type PwaSosStatus =
  | 'idle'
  | 'holding'
  | 'scene'
  | 'sending'
  | 'help-received'
  | 'dispatched'
  | 'resolved'
  | 'cancelled'
  | 'contacts-only'
  | 'location-blocked'
  | 'network-error';

export type PwaScanSession = {
  bootstrapComplete: boolean;
  verified: boolean;
  mobile: string;
  name: string;
  consentAccepted: boolean;
  pendingFlow: PwaFlowIntent;
  scannedVehicle: PwaScannedVehicle;
  reporterPlate: string;
  reporterFields: AlVehicleRcField[];
  reporterProtected: boolean;
  reporterPlanLabel: string | null;
  permissionsGranted: boolean;
  parkMePhotos: PwaParkMePhotos;
  parkMePhotoIds: PwaParkMePhotoIds;
  location: PwaGeoPoint | null;
  /** Reverse-geocoded place name from captured coordinates */
  locationName: string | null;
  parkMeStatus: PwaParkMeStatus;
  sosPhotos: PwaSosPhotos;
  sosPhotoIds: PwaSosPhotoIds;
  sosStatus: PwaSosStatus;
  simulateNetworkFail: boolean;
  locationDenied: boolean;
};

export const defaultPwaScanSession = (): PwaScanSession => ({
  bootstrapComplete: false,
  verified: false,
  mobile: '',
  name: '',
  consentAccepted: false,
  pendingFlow: null,
  scannedVehicle: {
    plate: 'MH 12 AB 1234',
    modelSummary: 'White · Maruti Swift',
    protected: true,
    planLabel: 'Safe',
    fields: [],
  },
  reporterPlate: '',
  reporterFields: [],
  reporterProtected: false,
  reporterPlanLabel: null,
  permissionsGranted: false,
  parkMePhotos: { front: null, rear: null },
  parkMePhotoIds: { front: null, rear: null },
  location: null,
  locationName: null,
  parkMeStatus: 'idle',
  sosPhotos: { front: null, rear: null, left: null, right: null },
  sosPhotoIds: { front: null, rear: null, left: null, right: null },
  sosStatus: 'idle',
  simulateNetworkFail: false,
  locationDenied: false,
});
