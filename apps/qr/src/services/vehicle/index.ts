export {
  lookupVehicleByPlate,
  normalizePlate,
  compactPlate,
  isPlateEntryReady,
  VAHAN_FETCH_HOLD_MS,
  type VehicleLookupResult,
  type VehicleLookupStatus,
} from './vehicle-service';
export { mapRcRecordToFields, mapRcRecordToVehicleSession } from './vehicle-mapper';
export { clearVehicleLookupCache } from './vehicle-cache';
