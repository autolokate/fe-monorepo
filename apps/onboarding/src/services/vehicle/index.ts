export {
  lookupVehicleByPlate,
  normalizePlate,
  compactPlate,
  isPlateEntryReady,
  VAHAN_FETCH_HOLD_MS,
  type VehicleLookupResult,
  type VehicleLookupStatus,
} from './vehicle-service.js';
export { mapRcRecordToFields, mapRcRecordToVehicleSession } from './vehicle-mapper.js';
export { clearVehicleLookupCache } from './vehicle-cache.js';
