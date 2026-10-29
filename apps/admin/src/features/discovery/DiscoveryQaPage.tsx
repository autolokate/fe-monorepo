import type { AdminCommunityQuestionDto } from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlSearchInput,
  AlSelect,
  AlStack,
  AlText,
} from '@autolokate/ui';
import { useCallback, useMemo, useState, type ChangeEvent } from 'react';

import {
  QA_CATEGORY_FILTERS,
  QA_SORT_OPTIONS,
  QA_STATUS_FILTERS,
} from '@/features/discovery/discovery-filters';
import { QuestionSheet } from '@/features/discovery/QuestionSheet';
import { useQaColumns } from '@/features/discovery/qa-columns';
import { useDiscoveryMutations } from '@/hooks/discovery/useDiscoveryMutations';
import { useDiscoveryQuestions } from '@/hooks/discovery/useDiscoveryQuestions';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminKpiStrip } from '@/platform/components/AdminWowSurface';
import { useCanWriteDiscoveryMutations } from '@/platform/rbac/module-write-permissions';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './discovery.css';

function qaKpisFromPage(questions: AdminCommunityQuestionDto[]) {
  let published = 0;
  let hidden = 0;
  for (const question of questions) {
    if (question.status === 'VISIBLE') published += 1;
    else hidden += 1;
  }
  return [
    { label: 'On this page', value: String(questions.length) },
    { label: 'Published', value: String(published) },
    { label: 'Hidden', value: String(hidden) },
  ];
}

export function DiscoveryQaPage() {
  const {
    questions,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    mayBeTruncated,
    userErrorMessage,
    status,
    setStatus,
    category,
    setCategory,
    sort,
    setSort,
    search,
    setSearch,
    refresh,
    data,
  } = useDiscoveryQuestions();

  const canWrite = useCanWriteDiscoveryMutations();
  const { updateQuestionMutation } = useDiscoveryMutations();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<AdminCommunityQuestionDto | null>(null);
  const [pendingQuestionId, setPendingQuestionId] = useState<string | null>(null);

  const openCreate = useCallback(() => {
    setSelected(null);
    setSheetOpen(true);
  }, []);

  const openEdit = useCallback((question: AdminCommunityQuestionDto) => {
    setSelected(question);
    setSheetOpen(true);
  }, []);

  const toggleVisibility = useCallback(
    (question: AdminCommunityQuestionDto) => {
      setPendingQuestionId(question.questionId);
      updateQuestionMutation.mutate(
        {
          questionId: question.questionId,
          body: { status: question.status === 'HIDDEN' ? 'VISIBLE' : 'HIDDEN' },
        },
        {
          onSettled: () => {
            setPendingQuestionId(null);
          },
        },
      );
    },
    [updateQuestionMutation],
  );

  const columns = useQaColumns({
    canWrite,
    pendingQuestionId,
    onToggleVisibility: toggleVisibility,
    onEdit: openEdit,
  });
  const kpiItems = useMemo(
    () => (questions.length > 0 ? qaKpisFromPage(questions) : []),
    [questions],
  );

  const pageDescription = 'Create, edit, publish and hide community Q&A.';

  if (userErrorMessage && !data) {
    return (
      <RequirePermission permission="discovery:read">
        <AlErrorState message={userErrorMessage} onRetry={refresh} />
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="discovery:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Discovery Q&A"
          description={pageDescription}
          actions={
            <>
              {canWrite ? <AlPageHeaderAction label="New Q&A" onClick={openCreate} /> : null}
              <AlPageHeaderAction
                label={isFetching ? 'Refreshing…' : 'Refresh'}
                loading={isFetching}
                variant="secondary"
                onClick={refresh}
              />
            </>
          }
        />

        {!isLoading && kpiItems.length > 0 ? <AdminKpiStrip items={kpiItems} /> : null}

        <AdminDataBlock
          filters={
            <>
              <AdminFilterField label="Status">
                <AdminFilterChips
                  options={QA_STATUS_FILTERS}
                  value={status}
                  onChange={setStatus}
                  aria-label="Q&A status"
                />
              </AdminFilterField>
              <AdminFilterField label="Category">
                <AlSelect
                  compact
                  aria-label="Q&A category"
                  options={QA_CATEGORY_FILTERS}
                  value={category}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    setCategory(event.target.value as typeof category);
                  }}
                />
              </AdminFilterField>
              <AdminFilterField label="Sort">
                <AlSelect
                  compact
                  aria-label="Q&A sort"
                  options={QA_SORT_OPTIONS}
                  value={sort}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    setSort(event.target.value as typeof sort);
                  }}
                />
              </AdminFilterField>
              <AdminFilterField label="Search">
                <AlSearchInput
                  compact
                  value={search}
                  onChange={setSearch}
                  placeholder="Search title or body…"
                  ariaLabel="Search Q&A"
                />
              </AdminFilterField>
            </>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="discovery-qa"
            columns={columns}
            data={questions}
            loading={isLoading}
            isRefreshing={isFetching && !isFetchingNextPage}
            error={userErrorMessage && data ? userErrorMessage : null}
            onRetry={refresh}
            enableGlobalSearch={false}
            emptyTitle="No Q&A found"
            emptyDescription={
              canWrite
                ? 'Create a Q&A or change the filters.'
                : 'Change the filters to see more questions.'
            }
            getRowId={(row) => row.questionId}
            onRowClick={openEdit}
          />
        </AdminDataBlock>

        {hasNextPage ? (
          <div className="discovery-load-more">
            <AlButton
              variant="secondary"
              size="sm"
              data-testid="discovery-qa-load-more"
              loading={isFetchingNextPage}
              onClick={() => {
                void fetchNextPage();
              }}
            >
              Load more
            </AlButton>
          </div>
        ) : null}
        {mayBeTruncated ? (
          <AlText tone="muted" variant="caption">
            Showing the first 100 results. Narrow the list with a filter or search to find the rest.
          </AlText>
        ) : null}

        <QuestionSheet
          question={selected}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          canWrite={canWrite}
        />
      </AlStack>
    </RequirePermission>
  );
}
