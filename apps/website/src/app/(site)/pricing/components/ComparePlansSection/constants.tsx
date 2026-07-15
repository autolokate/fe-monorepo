import type { Plan } from '@/services/plans';
import { formatRupeesFromPaise } from '@/app/home/components/SafetyPacksSection/constants';

export const COMPARE_COPY = {
  heading: 'Compare plans',
  collapsedLabel: 'View all features',
  expandedLabel: 'Show fewer features',
} as const;

/** A plan column in the compare table. */
export interface CompareColumn {
  id: string;
  name: string;
  price: string;
  popular: boolean;
}

/** A single feature row — `cells[i]` says whether column `i` includes it. */
export interface CompareFeatureRow {
  id: string;
  label: string;
  cells: boolean[];
}

/** Features grouped by the tier that introduces them. */
export interface CompareFeatureGroup {
  id: string;
  title: string;
  rows: CompareFeatureRow[];
}

export interface CompareData {
  columns: CompareColumn[];
  groups: CompareFeatureGroup[];
}

/**
 * Derive the compare matrix straight from the API plans. Plans are cumulative
 * (each tier "includes everything in" the one below it), so a feature that a
 * given tier introduces is checked for that tier and every higher one.
 */
export function buildCompareData(plans: Plan[]): CompareData {
  const sorted = [...plans].sort((a, b) => a.pricePaise - b.pricePaise);

  const columns: CompareColumn[] = sorted.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: formatRupeesFromPaise(plan.pricePaise),
    popular: Boolean(plan.badge),
  }));

  const groups: CompareFeatureGroup[] = sorted.map((plan, introIndex) => ({
    id: plan.id,
    title: plan.name,
    rows: plan.features.map((label, rowIndex) => ({
      id: `${plan.id}-${rowIndex}`,
      label,
      cells: sorted.map((_, colIndex) => colIndex >= introIndex),
    })),
  }));

  return { columns, groups };
}
