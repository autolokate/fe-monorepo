import type { EmergencyContactDto } from '@autolokate/api-client';

import { CONTACT_RELATIONSHIP_OPTIONS } from '@/features/emergency/data/relationships';
import type { EmergencyContact, RelationshipId } from '@/features/emergency/types';

export function mapApiRelationToId(relation: string | null): RelationshipId {
  if (!relation?.trim()) {
    return 'other';
  }
  const normalized = relation.trim().toLowerCase();
  const fromLabel = CONTACT_RELATIONSHIP_OPTIONS.find(
    (option) => option.label.toLowerCase() === normalized,
  )?.id;
  if (fromLabel) {
    return fromLabel;
  }
  const fromId = CONTACT_RELATIONSHIP_OPTIONS.find((option) => option.id === normalized)?.id;
  return fromId ?? 'other';
}

export function mapApiRelationToLabel(relationId: RelationshipId): string {
  return (
    CONTACT_RELATIONSHIP_OPTIONS.find((option) => option.id === relationId)?.label ?? relationId
  );
}

/** Map masked API contact into journey session shape. */
export function mapEmergencyContactDto(dto: EmergencyContactDto): EmergencyContact {
  return {
    id: dto.id,
    name: dto.name.trim(),
    mobile: dto.phoneMasked,
    phoneMasked: dto.phoneMasked,
    relation: mapApiRelationToId(dto.relation),
    verified: true,
  };
}

export function mapEmergencyContactDtos(dtos: EmergencyContactDto[]): EmergencyContact[] {
  return dtos.map(mapEmergencyContactDto);
}
