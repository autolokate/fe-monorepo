import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { cn } from '../../utils/cn.js';
import { AlButton } from '../primitives/Button/index.js';
import { AlScreenSpinner } from '../primitives/ScreenSpinner/index.js';
import { AlCheckbox } from '../forms/Checkbox/index.js';
import { AlEmptyState } from './EmptyState.js';
import { AlErrorState } from './EmptyState.js';
import {
  copyCellValue,
  exportTableToCsv,
  getColumnDisplayLabel,
  loadDataTablePrefs,
  saveDataTablePrefs,
  type DataTableDensity,
  type DataTablePrefs,
} from './data-table-utils.js';
import { AlSearchInput } from './SearchInput.js';
import { AlToolbar } from './SearchInput.js';
import './DataTable.css';

function SortIcon() {
  return (
    <svg className="al-data-table__sort-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 4.5L6 1.5L9 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 7.5L6 10.5L9 7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
    </svg>
  );
}

function getAriaSortValue(sort: false | 'asc' | 'desc'): 'none' | 'ascending' | 'descending' | 'other' {
  if (sort === 'asc') {
    return 'ascending';
  }
  if (sort === 'desc') {
    return 'descending';
  }
  return 'none';
}

export type AlDataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  /** Persists density, page size, and column visibility in localStorage. */
  tableId?: string;
  loading?: boolean;
  isRefreshing?: boolean;
  error?: string | null;
  onRetry?: () => void;
  enableGlobalSearch?: boolean;
  globalSearchPlaceholder?: string;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableColumnResize?: boolean;
  enableColumnPinning?: boolean;
  enableMultiSort?: boolean;
  enableCopyCell?: boolean;
  enableCsvExport?: boolean;
  enableDensitySwitch?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  pageSize?: number;
  pageSizeOptions?: number[];
  stickyHeader?: boolean;
  stickyToolbar?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbarTrailing?: ReactNode;
  bulkActions?: ReactNode;
  getRowId?: (row: TData) => string;
  onRowClick?: (row: TData) => void;
  onCellCopied?: (value: string) => void;
};

export function AlDataTable<TData>({
  columns,
  data,
  tableId,
  loading = false,
  isRefreshing = false,
  error = null,
  onRetry,
  enableGlobalSearch = true,
  globalSearchPlaceholder = 'Search rows…',
  enableRowSelection = false,
  enableColumnVisibility = true,
  enableColumnResize = true,
  enableColumnPinning = true,
  enableMultiSort = true,
  enableCopyCell = true,
  enableCsvExport = true,
  enableDensitySwitch = true,
  rowSelection,
  onRowSelectionChange,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  stickyHeader = true,
  stickyToolbar = true,
  emptyTitle = 'No results',
  emptyDescription = 'Try adjusting filters or search.',
  toolbarTrailing,
  bulkActions,
  getRowId,
  onRowClick,
  onCellCopied,
}: AlDataTableProps<TData>) {
  const initialPrefs = useMemo(
    () =>
      tableId
        ? loadDataTablePrefs(tableId, { pageSize, density: 'comfortable' })
        : ({ pageSize, density: 'comfortable', columnVisibility: {} } satisfies DataTablePrefs),
    [pageSize, tableId],
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialPrefs.columnVisibility,
  );
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: enableRowSelection && enableColumnPinning ? ['__select'] : [],
    right: [],
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
  const [density, setDensity] = useState<DataTableDensity>(initialPrefs.density);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const selectionColumns = useMemo<ColumnDef<TData>[]>(() => {
    if (!enableRowSelection) {
      return columns;
    }
    return [
      {
        id: '__select',
        header: ({ table: dataTable }) => (
          <AlCheckbox
            layout="icon-only"
            label="Select all rows on this page"
            checked={dataTable.getIsAllPageRowsSelected()}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              dataTable.toggleAllPageRowsSelected(event.target.checked);
            }}
          />
        ),
        cell: ({ row }) => (
          <div
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <AlCheckbox
              layout="icon-only"
              label={`Select row ${String(row.index + 1)}`}
              checked={row.getIsSelected()}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                row.toggleSelected(event.target.checked);
              }}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 44,
      },
      ...columns,
    ];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: selectionColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnPinning,
      globalFilter,
      rowSelection: rowSelection ?? internalRowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility((current) => {
        const next = typeof updater === 'function' ? updater(current) : updater;
        if (tableId) {
          saveDataTablePrefs(tableId, { columnVisibility: next });
        }
        return next;
      });
    },
    onColumnPinningChange: setColumnPinning,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableColumnResizing: enableColumnResize,
    columnResizeMode: 'onChange',
    enableColumnPinning,
    enableMultiSort: enableMultiSort,
    ...(getRowId ? { getRowId: (row: TData) => getRowId(row) } : {}),
    initialState: {
      pagination: { pageSize: initialPrefs.pageSize },
    },
  });

  useEffect(() => {
    if (tableId) {
      saveDataTablePrefs(tableId, { density });
    }
  }, [density, tableId]);

  const handlePageSizeChange = useCallback(
    (nextPageSize: number) => {
      table.setPageSize(nextPageSize);
      if (tableId) {
        saveDataTablePrefs(tableId, { pageSize: nextPageSize });
      }
    },
    [table, tableId],
  );

  const handleExportCsv = useCallback(() => {
    const exportName = tableId ?? 'export';
    exportTableToCsv(table, exportName);
  }, [table, tableId]);

  const handleCellCopy = useCallback(
    async (value: unknown) => {
      await copyCellValue(value);
      onCellCopied?.(formatCellValueForCallback(value));
    },
    [onCellCopied],
  );

  const handleRowKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTableRowElement>, rowIndex: number, rowData: TData) => {
      const rows = table.getRowModel().rows;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = Math.min(rowIndex + 1, rows.length - 1);
        setFocusedRowIndex(next);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const next = Math.max(rowIndex - 1, 0);
        setFocusedRowIndex(next);
        return;
      }
      if (event.key === 'Enter' && onRowClick) {
        event.preventDefault();
        onRowClick(rowData);
      }
    },
    [onRowClick, table],
  );

  useEffect(() => {
    if (focusedRowIndex === null) {
      return;
    }
    const row = tableRef.current?.querySelector<HTMLTableRowElement>(
      `tbody tr[data-row-index="${String(focusedRowIndex)}"]`,
    );
    row?.focus();
  }, [focusedRowIndex, table.getRowModel().rows.length]);

  const selectedCount = Object.keys(rowSelection ?? internalRowSelection).length;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const showLoadingState = loading && data.length === 0;
  const isEmpty = !loading && filteredCount === 0;

  if (error) {
    return (
      <AlErrorState
        message={error}
        {...(onRetry ? { onRetry } : {})}
      />
    );
  }

  return (
    <div
      ref={tableRef}
      className={cn(
        'al-data-table',
        density === 'compact' && 'al-data-table--compact',
        isRefreshing && 'al-data-table--refreshing',
      )}
    >
      <AlToolbar
        inset
        className={cn(stickyToolbar && 'al-data-table__toolbar--sticky')}
        leading={
          enableGlobalSearch ? (
            <AlSearchInput
              compact
              value={globalFilter}
              onChange={setGlobalFilter}
              placeholder={globalSearchPlaceholder}
              ariaLabel="Search table rows"
            />
          ) : undefined
        }
        trailing={
          <>
            {selectedCount > 0 ? (
              <>
                <span className="al-toolbar__meta">{selectedCount} selected</span>
                {bulkActions}
              </>
            ) : (
              <span className={cn('al-toolbar__meta', (isRefreshing || showLoadingState) && 'is-pulsing')}>
                {showLoadingState ? 'Loading…' : isRefreshing ? 'Refreshing…' : `${String(filteredCount)} rows`}
              </span>
            )}
            {enableDensitySwitch ? (
              <div className="al-data-table__density" role="group" aria-label="Table density">
                <AlButton
                  variant={density === 'compact' ? 'primary' : 'secondary'}
                  size="sm"
                  aria-pressed={density === 'compact'}
                  onClick={() => {
                    setDensity('compact');
                  }}
                >
                  Compact
                </AlButton>
                <AlButton
                  variant={density === 'comfortable' ? 'primary' : 'secondary'}
                  size="sm"
                  aria-pressed={density === 'comfortable'}
                  onClick={() => {
                    setDensity('comfortable');
                  }}
                >
                  Comfortable
                </AlButton>
              </div>
            ) : null}
            {enableCsvExport ? (
              <AlButton variant="secondary" size="sm" onClick={handleExportCsv}>
                Export CSV
              </AlButton>
            ) : null}
            {enableColumnVisibility ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <AlButton variant="secondary" size="sm">
                    Columns
                  </AlButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="al-data-table__column-menu" align="end" sideOffset={6}>
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => (
                        <DropdownMenu.Item
                          key={column.id}
                          className="al-data-table__column-menu-item al-admin-focus-ring"
                          onSelect={(event) => {
                            event.preventDefault();
                            column.toggleVisibility(!column.getIsVisible());
                          }}
                        >
                          <AlCheckbox
                            layout="icon-only"
                            label={`Toggle ${getColumnDisplayLabel(column)} column`}
                            checked={column.getIsVisible()}
                            readOnly
                          />
                          <span>{getColumnDisplayLabel(column)}</span>
                        </DropdownMenu.Item>
                      ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : null}
            {toolbarTrailing}
          </>
        }
      />

      {showLoadingState ? (
        <div className="al-data-table__loading" role="status" aria-live="polite" aria-busy="true">
          <AlScreenSpinner size="md" animated aria-label="Loading table data" />
        </div>
      ) : isEmpty ? (
        <div className="al-data-table__empty">
          <AlEmptyState
            compact
            title={emptyTitle}
            description={emptyDescription}
          />
        </div>
      ) : (
        <div className="al-data-table__scroll">
          <table className={cn('al-data-table__table', stickyHeader && 'is-sticky')}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={header.column.getCanSort() ? getAriaSortValue(sorted) : undefined}
                        className={cn(
                          header.column.getIsPinned() === 'left' && 'is-pinned-left',
                          header.column.getIsPinned() === 'right' && 'is-pinned-right',
                        )}
                        style={{
                          width: header.getSize(),
                          minWidth: header.column.columnDef.minSize,
                          maxWidth: header.column.columnDef.maxSize,
                        }}
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <button
                            type="button"
                            className={cn(
                              'al-data-table__sort al-admin-focus-ring',
                              sorted && 'is-sorted',
                              sorted === 'desc' && 'is-desc',
                            )}
                            onClick={(event) => {
                              header.column.toggleSorting(
                                undefined,
                                enableMultiSort && (event.shiftKey || event.metaKey),
                              );
                            }}
                            title={enableMultiSort ? 'Click to sort. Shift+click for multi-sort.' : undefined}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <SortIcon />
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                        {enableColumnResize && header.column.getCanResize() ? (
                          <div
                            className={cn(
                              'al-data-table__resize-handle',
                              header.column.getIsResizing() && 'is-resizing',
                            )}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                            aria-hidden
                          />
                        ) : null}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, rowIndex) => (
                    <tr
                      key={row.id}
                      data-row-index={rowIndex}
                      tabIndex={focusedRowIndex === rowIndex || (focusedRowIndex === null && rowIndex === 0) ? 0 : -1}
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                      className={cn(onRowClick && 'is-clickable')}
                      onFocus={() => {
                        setFocusedRowIndex(rowIndex);
                      }}
                      onKeyDown={(event) => {
                        handleRowKeyDown(event, rowIndex, row.original);
                      }}
                      onClick={
                        onRowClick
                          ? () => {
                              onRowClick(row.original);
                            }
                          : undefined
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={cn(
                            enableCopyCell && 'is-copyable',
                            cell.column.getIsPinned() === 'left' && 'is-pinned-left',
                            cell.column.getIsPinned() === 'right' && 'is-pinned-right',
                          )}
                          title={enableCopyCell ? 'Click to copy' : undefined}
                          onClick={
                            enableCopyCell
                              ? (event) => {
                                  event.stopPropagation();
                                  void handleCellCopy(cell.getValue());
                                }
                              : undefined
                          }
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {!isEmpty ? (
        <footer className="al-data-table__footer">
          <div className="al-data-table__page-size">
            <span>Rows per page</span>
            <select
              value={table.getState().pagination.pageSize}
              aria-label="Rows per page"
              onChange={(event) => {
                handlePageSizeChange(Number(event.target.value));
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <span className="al-data-table__footer-meta">
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
            {sorting.length > 0
              ? ` · ${String(sorting.length)} sort${sorting.length > 1 ? 's' : ''}`
              : ''}
          </span>
          <div className="al-data-table__pagination">
            <AlButton
              variant="secondary"
              size="sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => {
                table.previousPage();
              }}
            >
              Previous
            </AlButton>
            <AlButton
              variant="secondary"
              size="sm"
              disabled={!table.getCanNextPage()}
              onClick={() => {
                table.nextPage();
              }}
            >
              Next
            </AlButton>
          </div>
        </footer>
      ) : null}
    </div>
  );
}

function formatCellValueForCallback(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    // Un-serializable (e.g. circular) — fall back to the tag string rather than String(value), which
    // the base-to-string lint rule (correctly) rejects for non-primitives.
    return Object.prototype.toString.call(value);
  }
}

export type { ColumnDef, RowSelectionState, SortingState, DataTableDensity };
