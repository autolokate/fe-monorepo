import type { AdminCommunityQuestionDto } from '@autolokate/api-client';
import { AlButton, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import {
  QA_CATEGORY_LABELS,
  formatDiscoveryDateTime,
} from '@/features/discovery/discovery-filters';
import { DiscoveryQaStatusBadge } from '@/platform/components/EntityStatusBadge';

export type UseQaColumnsOptions = {
  canWrite: boolean;
  pendingQuestionId: string | null;
  onToggleVisibility: (question: AdminCommunityQuestionDto) => void;
  onEdit: (question: AdminCommunityQuestionDto) => void;
};

export function useQaColumns({
  canWrite,
  pendingQuestionId,
  onToggleVisibility,
  onEdit,
}: UseQaColumnsOptions): ColumnDef<AdminCommunityQuestionDto>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Question',
        cell: ({ row }) => (
          <div className="discovery-cell-title">
            <span className="discovery-cell-title__primary">{row.original.title}</span>
            {row.original.vehicleLabel ? (
              <span className="discovery-cell-title__secondary">{row.original.vehicleLabel}</span>
            ) : null}
          </div>
        ),
      },
      {
        id: 'category',
        header: 'Category',
        accessorFn: (row) => QA_CATEGORY_LABELS[row.category],
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <DiscoveryQaStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'answerCount',
        header: 'Answers',
        cell: ({ row }) => row.original.answerCount.toLocaleString(),
      },
      {
        accessorKey: 'authorUsername',
        header: 'Author',
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => formatDiscoveryDateTime(row.original.updatedAt),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const question = row.original;
          const pending = pendingQuestionId === question.questionId;
          return (
            <div className="discovery-row-actions">
              {canWrite ? (
                <AlButton
                  size="sm"
                  variant="secondary"
                  data-testid={`discovery-qa-toggle-${question.questionId}`}
                  loading={pending}
                  disabled={pendingQuestionId !== null}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleVisibility(question);
                  }}
                >
                  {question.status === 'HIDDEN' ? 'Publish' : 'Hide'}
                </AlButton>
              ) : null}
              <AlButton
                size="sm"
                variant="secondary"
                data-testid={`discovery-qa-open-${question.questionId}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(question);
                }}
              >
                {canWrite ? 'Edit' : 'View'}
              </AlButton>
            </div>
          );
        },
      },
    ],
    [canWrite, onEdit, onToggleVisibility, pendingQuestionId],
  );
}
