/** Sensible defaults for admin list tables — less toolbar noise, row click to open detail. */
export const ADMIN_LIST_TABLE_PROPS = {
  enableRowSelection: false,
  enableDensitySwitch: false,
  enableCsvExport: false,
  enableColumnVisibility: false,
  enableCopyCell: false,
  stickyHeader: true,
  stickyToolbar: false,
  pageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
};
