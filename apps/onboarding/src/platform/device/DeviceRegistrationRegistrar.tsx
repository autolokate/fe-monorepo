import { useRegisterDevice } from '@/hooks/device/useRegisterDevice.js';

/** Mount-only — registers device for push when a session exists; renders nothing. */
export function DeviceRegistrationRegistrar() {
  useRegisterDevice();
  return null;
}
