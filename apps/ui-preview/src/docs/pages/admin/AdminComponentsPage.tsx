import {
  AlBadge,
  AlBreadcrumb,
  AlButton,
  AlConfirmationDialog,
  AlDataTable,
  AlEmptyState,
  AlErrorState,
  AlFilterBar,
  AlHeading,
  AlMetricCard,
  AlPageHeader,
  AlProgress,
  AlSearchInput,
  AlSectionHeader,
  AlSkeleton,
  AlStack,
  AlStatCard,
  AlStatusBadge,
  AlTabs,
  AlText,
  AlToolbar,
  type ColumnDef,
} from '@autolokate/ui';
import { useMemo, useState } from 'react';

type DemoRow = {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'inactive';
  count: number;
};

const demoRows: DemoRow[] = [
  { id: '1', name: 'Batch A', status: 'active', count: 1200 },
  { id: '2', name: 'Batch B', status: 'pending', count: 400 },
  { id: '3', name: 'Batch C', status: 'inactive', count: 50 },
  { id: '4', name: 'Batch D', status: 'active', count: 890 },
  { id: '5', name: 'Batch E', status: 'pending', count: 210 },
];

const columns: ColumnDef<DemoRow>[] = [
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <AlStatusBadge label={row.original.status} status={row.original.status} />,
  },
  {
    accessorKey: 'count',
    header: 'Count',
    cell: ({ row }) => row.original.count.toLocaleString(),
  },
];

export function AdminComponentsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('layout');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const data = useMemo(() => demoRows, []);

  return (
    <section className="ds-card ds-card--showcase">
      <AlStack gap="xl">
        <AlStack gap="sm">
          <AlHeading variant="h3">Admin design system</AlHeading>
          <AlText tone="muted">
            Production admin primitives — layout, data table, states, and interaction patterns.
          </AlText>
        </AlStack>

        <AlTabs
          value={tab}
          onValueChange={setTab}
          ariaLabel="Admin component sections"
          items={[
            {
              id: 'layout',
              label: 'Layout',
              content: (
                <AlStack gap="lg">
                  <AlPageHeader
                    title="Page header"
                    description="Top-of-page title block with breadcrumbs and actions."
                    breadcrumbs={
                      <AlBreadcrumb
                        items={[
                          { label: 'Admin', onClick: () => undefined },
                          { label: 'Components', current: true },
                        ]}
                      />
                    }
                    actions={<AlButton variant="primary" size="sm">Primary action</AlButton>}
                  />
                  <AlSectionHeader title="Section header" description="Secondary sections within a page." />
                  <AlStack gap="md" direction="row">
                    <AlMetricCard label="Provisioned" value="1,650" hint="Example metric" trend={{ label: '+8%', direction: 'up' }} />
                    <AlStatCard label="Pending" value="24" hint="Awaiting review" />
                  </AlStack>
                </AlStack>
              ),
            },
            {
              id: 'table',
              label: 'Data table',
              content: (
                <AlDataTable
                  columns={columns}
                  data={showLoading ? [] : data}
                  loading={showLoading}
                  enableRowSelection
                  getRowId={(row) => row.id}
                />
              ),
            },
            {
              id: 'toolbar',
              label: 'Toolbar',
              content: (
                <AlStack gap="md">
                  <AlToolbar
                    leading={<AlSearchInput value={search} onChange={setSearch} placeholder="Search…" />}
                    trailing={<AlBadge variant="info">Demo</AlBadge>}
                  />
                  <AlFilterBar>
                    <AlBadge>Active</AlBadge>
                    <AlBadge variant="warning">Pending</AlBadge>
                    <AlBadge variant="neutral">Archived</AlBadge>
                  </AlFilterBar>
                </AlStack>
              ),
            },
            {
              id: 'states',
              label: 'States',
              content: (
                <AlStack gap="lg">
                  <AlSectionHeader title="Empty" />
                  <AlEmptyState title="No records" description="Shown when a table or list has no rows." />
                  <AlSectionHeader title="Error" />
                  <AlErrorState message="Failed to load preview data." onRetry={() => undefined} />
                  <AlSectionHeader title="Loading" />
                  <AlStack gap="sm">
                    <AlSkeleton width="100%" height={40} />
                    <AlSkeleton width="100%" height={40} />
                    <AlProgress value={45} label="Loading progress" />
                  </AlStack>
                  <AlButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowLoading((value) => !value);
                    }}
                  >
                    Toggle table loading
                  </AlButton>
                </AlStack>
              ),
            },
            {
              id: 'dialogs',
              label: 'Dialogs',
              content: (
                <AlStack gap="md">
                  <AlButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setConfirmOpen(true);
                    }}
                  >
                    Open confirmation dialog
                  </AlButton>
                </AlStack>
              ),
            },
          ]}
        />

        <AlConfirmationDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Confirm action"
          description="Admin confirmation dialog with Autolokate styling."
          confirmLabel="Continue"
          onConfirm={() => {
            setConfirmOpen(false);
          }}
        />
      </AlStack>
    </section>
  );
}
