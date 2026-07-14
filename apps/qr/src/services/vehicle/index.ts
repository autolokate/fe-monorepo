export {
  lookupVehicleByPlate,
  normalizePlate,
  compactPlate,
  isPlateEntryReady,
  type VehicleLookupResult,
  type VehicleLookupStatus,
} from './vehicle-service';
export { mapRcRecordToFields, mapRcRecordToVehicleSession } from './vehicle-mapper';
export { clearVehicleLookupCache } from './vehicle-cache';
