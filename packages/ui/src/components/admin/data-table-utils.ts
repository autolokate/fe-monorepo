import type { Column, ColumnDef, Row, Table } from '@tanstack/react-table';
import type { VisibilityState } from '@tanstack/react-table';

export type DataTableDensity = 'compact' | 'comfortable';

export type DataTablePrefs = {
  density: DataTableDensity;
  pageSize: number;
  columnVisibility: VisibilityState;
};

const PREFS_PREFIX = 'al-data-table-prefs:';

export function loadDataTablePrefs(
  tableId: string,
  defaults: Partial<DataTablePrefs>,
): DataTablePrefs {
  if (typeof window === 'undefined') {
    return {
      density: defaults.density ?? 'comfortable',
      pageSize: defaults.pageSize ?? 20,
      columnVisibility: defaults.columnVisibility ?? {},
    };
  }

  try {
    const raw = window.localStorage.getItem(`${PREFS_PREFIX}${tableId}`);
    if (!raw) {
      return {
        density: defaults.density ?? 'comfortable',
        pageSize: defaults.pageSize ?? 20,
        columnVisibility: defaults.columnVisibility ?? {},
      };
    }
    const parsed = JSON.parse(raw) as Partial<DataTablePrefs>;
    return {
      density: parsed.density === 'compact' ? 'compact' : 'comfortable',
      pageSize:
        typeof parsed.pageSize === 'number' && parsed.pageSize > 0
          ? parsed.pageSize
          : (defaults.pageSize ?? 20),
      columnVisibility:
        parsed.columnVisibility && typeof parsed.columnVisibility === 'object'
          ? parsed.columnVisibility
          : (defaults.columnVisibility ?? {}),
    };
  } catch {
    return {
      density: defaults.density ?? 'comfortable',
      pageSize: defaults.pageSize ?? 20,
      columnVisibility: defaults.columnVisibility ?? {},
    };
  }
}

export function saveDataTablePrefs(tableId: string, prefs: Partial<DataTablePrefs>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const existing = loadDataTablePrefs(tableId, {});
    const next: DataTablePrefs = {
      density: prefs.density ?? existing.density,
      pageSize: prefs.pageSize ?? existing.pageSize,
      columnVisibility: prefs.columnVisibility ?? existing.columnVisibility,
    };
    window.localStorage.setItem(`${PREFS_PREFIX}${tableId}`, JSON.stringify(next));
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function getColumnDisplayLabel<TData>(column: Column<TData>): string {
  const header = column.columnDef.header;
  if (typeof header === 'string') {
    return header;
  }
  const metaLabel = (column.columnDef.meta as { label?: string } | undefined)?.label;
  if (metaLabel) {
    return metaLabel;
  }
  return column.id;
}

function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  try {
    return JSON.stringify(value);
  } catch {
    // Un-serializable (e.g. circular) — fall back to the tag string ('[object Object]') rather than
    // String(value), which the base-to-string lint rule (correctly) rejects for non-primitives.
    return Object.prototype.toString.call(value);
  }
}

export function exportTableToCsv<TData>(table: Table<TData>, filename: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getIsVisible() && column.id !== '__select');

  const headerRow = columns
    .map((column) => escapeCsvValue(getColumnDisplayLabel(column)))
    .join(',');
  const bodyRows = table
    .getFilteredRowModel()
    .rows.map((row: Row<TData>) =>
      columns.map((column) => escapeCsvValue(formatCellValue(row.getValue(column.id)))).join(','),
    );

  const csv = [headerRow, ...bodyRows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function copyCellValue(value: unknown): Promise<void> {
  const text = formatCellValue(value);
  // DOM types declare navigator.clipboard as always-present, but it's absent in insecure contexts /
  // SSR — the `| undefined` cast keeps this a real runtime guard without tripping no-unnecessary-condition.
  if (
    !text ||
    typeof navigator === 'undefined' ||
    !(navigator.clipboard as Clipboard | undefined)
  ) {
    return;
  }
  await navigator.clipboard.writeText(text);
}

export type { ColumnDef };
