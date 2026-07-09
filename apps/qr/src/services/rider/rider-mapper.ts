import type { RiderDto } from '@autolokate/api-client';

import type { EmergencyRider } from '@/features/emergency/types.js';

import { mapApiRelationToLabel, mapApiRelationToId } from '../emergency/emergency-contact-mapper.js';

/** Map masked API rider into journey session shape. */
export function mapRiderDto(dto: RiderDto): EmergencyRider {
  return {
    id: dto.id,
    mobile: dto.phoneMasked,
    phoneMasked: dto.phoneMasked,
    name: dto.name.trim(),
    relation: mapApiRelationToId(dto.relation),
  };
}

export function mapRiderDtos(dtos: RiderDto[]): EmergencyRider[] {
  return dtos.map(mapRiderDto);
}

export { mapApiRelationToLabel };
