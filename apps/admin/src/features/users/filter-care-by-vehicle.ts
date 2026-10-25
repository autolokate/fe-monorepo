/** Keep only rows whose `vehicleId` exactly matches the selected vehicle. */
export function filterCareByVehicleId<T extends { vehicleId: string }>(
  rows: readonly T[],
  vehicleId: string | null,
): T[] {
  if (!vehicleId) {
    return [];
  }
  return rows.filter((row) => row.vehicleId === vehicleId);
}
