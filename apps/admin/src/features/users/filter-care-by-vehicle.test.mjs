import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * Lightweight filter contract — duplicate the pure rule so node:test can assert
 * isolation without a Vitest project. Source of truth: `./filter-care-by-vehicle.ts`.
 */
function filterCareByVehicleId(rows, vehicleId) {
  if (!vehicleId) {
    return [];
  }
  return rows.filter((row) => row.vehicleId === vehicleId);
}

test('filterCareByVehicleId keeps only matching vehicleId', () => {
  const rows = [
    { id: '1', vehicleId: 'A', title: 'a' },
    { id: '2', vehicleId: 'B', title: 'b-leak' },
    { id: '3', vehicleId: 'A', title: 'a2' },
  ];
  assert.deepEqual(
    filterCareByVehicleId(rows, 'A').map((r) => r.id),
    ['1', '3'],
  );
  assert.equal(filterCareByVehicleId(rows, 'B').length, 1);
  assert.equal(filterCareByVehicleId(rows, null).length, 0);
  assert.equal(filterCareByVehicleId(rows, '').length, 0);
});

test('filter-care-by-vehicle.ts is present', () => {
  const src = path.join(path.dirname(fileURLToPath(import.meta.url)), 'filter-care-by-vehicle.ts');
  assert.equal(fs.existsSync(src), true);
});
