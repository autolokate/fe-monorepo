import type {
  AdminQaSort,
  AdminQaStatus,
  AdminReelSort,
  AdminReelStatus,
  CommunityQuestionCategory,
  CommunityQuestionKind,
} from '@autolokate/api-client';

export type FilterOption<T extends string> = { value: T; label: string };

export const QA_STATUS_FILTERS: FilterOption<AdminQaStatus | 'ALL'>[] = [
  { value: 'ALL', label: 'All' },
  { value: 'VISIBLE', label: 'Published' },
  { value: 'HIDDEN', label: 'Hidden' },
];

export const QA_CATEGORY_LABELS: Record<CommunityQuestionCategory, string> = {
  problems: 'Problems',
  maintenance: 'Maintenance',
  buying: 'Buying',
  mods: 'Mods',
  ev: 'EV',
  safety: 'Safety',
  tyres: 'Tyres',
  insurance: 'Insurance',
  roadTrips: 'Road trips',
};

export const QA_CATEGORY_OPTIONS: FilterOption<CommunityQuestionCategory>[] = (
  Object.entries(QA_CATEGORY_LABELS) as [CommunityQuestionCategory, string][]
).map(([value, label]) => ({ value, label }));

export const QA_CATEGORY_FILTERS: FilterOption<CommunityQuestionCategory | 'ALL'>[] = [
  { value: 'ALL', label: 'All categories' },
  ...QA_CATEGORY_OPTIONS,
];

export const QA_KIND_OPTIONS: FilterOption<CommunityQuestionKind>[] = [
  { value: 'general', label: 'General' },
  { value: 'problem', label: 'Problem' },
  { value: 'customMods', label: 'Custom mods' },
];

export const QA_SORT_OPTIONS: FilterOption<AdminQaSort>[] = [
  { value: 'latest', label: 'Newest' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'most_answered', label: 'Most answered' },
];

export const REEL_STATUS_FILTERS: FilterOption<AdminReelStatus | 'ALL'>[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const REEL_SORT_OPTIONS: FilterOption<AdminReelSort>[] = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'published', label: 'Recently published' },
  { value: 'sort_order', label: 'Feed order' },
  { value: 'likes', label: 'Most liked' },
];

export function formatDiscoveryDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
}

export function formatCount(value: number): string {
  return value.toLocaleString();
}
