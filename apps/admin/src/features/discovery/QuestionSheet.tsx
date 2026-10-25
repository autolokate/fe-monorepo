import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminCommunityQuestionDto } from '@autolokate/api-client';
import { AlButton, AlCheckbox, AlInput, AlModal, AlSelect } from '@autolokate/ui';
import { useEffect, useMemo, useRef, type ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { DiscoveryTextArea } from '@/features/discovery/DiscoveryTextArea';
import {
  QA_CATEGORY_OPTIONS,
  QA_KIND_OPTIONS,
  formatDiscoveryDateTime,
} from '@/features/discovery/discovery-filters';
import {
  EMPTY_QUESTION_FORM,
  questionFormSchema,
  questionToFormValues,
  toCreateQuestionBody,
  toUpdateQuestionBody,
  type QuestionFormValues,
} from '@/features/discovery/qa-schemas';
import { useDiscoveryMutations } from '@/hooks/discovery/useDiscoveryMutations';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { DiscoveryQaStatusBadge } from '@/platform/components/EntityStatusBadge';

export type QuestionSheetProps = {
  /** `null` = create a new question; otherwise edit that one. */
  question: AdminCommunityQuestionDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite: boolean;
};

export function QuestionSheet({ question, open, onOpenChange, canWrite }: QuestionSheetProps) {
  const abortRef = useRef<AbortController | null>(null);
  const { createQuestionMutation, updateQuestionMutation, resolveSubmitError } =
    useDiscoveryMutations();
  const isEdit = question !== null;

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: EMPTY_QUESTION_FORM,
  });

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      return;
    }
    form.reset(question ? questionToFormValues(question) : EMPTY_QUESTION_FORM);
    createQuestionMutation.reset();
    updateQuestionMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the sheet opens / target changes
  }, [form, open, question]);

  const activeMutation = isEdit ? updateQuestionMutation : createQuestionMutation;
  const isBusy = activeMutation.isPending;
  const submitError = activeMutation.isError ? resolveSubmitError(activeMutation.error) : null;

  const beginRequest = (): AbortSignal => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller.signal;
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (isBusy) {
      return;
    }
    const signal = beginRequest();
    try {
      if (question) {
        const body = toUpdateQuestionBody(values, question);
        if (Object.keys(body).length === 0) {
          return;
        }
        await updateQuestionMutation.mutateAsync({
          questionId: question.questionId,
          body,
          signal,
        });
      } else {
        await createQuestionMutation.mutateAsync({ body: toCreateQuestionBody(values), signal });
      }
      onOpenChange(false);
    } catch {
      // Surfaced via mutation state + toast.
    }
  });

  const setVisibility = async (status: 'VISIBLE' | 'HIDDEN') => {
    if (!question || isBusy) {
      return;
    }
    try {
      await updateQuestionMutation.mutateAsync({
        questionId: question.questionId,
        body: { status },
        signal: beginRequest(),
      });
      onOpenChange(false);
    } catch {
      // Surfaced via mutation state + toast.
    }
  };

  const watched = form.watch();
  const hasChanges = useMemo(
    () => (question ? Object.keys(toUpdateQuestionBody(watched, question)).length > 0 : true),
    [question, watched],
  );

  const title = !isEdit ? 'New Q&A' : canWrite ? 'Edit Q&A' : 'Q&A detail';

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={title}
      description={
        isEdit
          ? 'Published Q&A is visible in the consumer Discovery feed; hidden Q&A is not.'
          : 'New Q&A is saved hidden unless you publish it now.'
      }
      footer={
        <div className="admin-modal-actions">
          {canWrite ? (
            <>
              <AlButton
                type="submit"
                form="discovery-question-form"
                size="sm"
                data-testid="discovery-qa-submit"
                loading={isBusy}
                disabled={isBusy || (isEdit && !hasChanges)}
              >
                {isEdit
                  ? 'Save changes'
                  : watched.publishNow
                    ? 'Create and publish'
                    : 'Create draft'}
              </AlButton>
              {question ? (
                question.status === 'HIDDEN' ? (
                  <AlButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    data-testid="discovery-qa-publish"
                    title={hasChanges ? 'Save or discard your edits first.' : undefined}
                    disabled={isBusy || hasChanges}
                    onClick={() => {
                      void setVisibility('VISIBLE');
                    }}
                  >
                    Publish
                  </AlButton>
                ) : (
                  <AlButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    data-testid="discovery-qa-hide"
                    title={hasChanges ? 'Save or discard your edits first.' : undefined}
                    disabled={isBusy || hasChanges}
                    onClick={() => {
                      void setVisibility('HIDDEN');
                    }}
                  >
                    Hide
                  </AlButton>
                )
              ) : null}
            </>
          ) : null}
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={isBusy}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {canWrite ? 'Cancel' : 'Close'}
          </AlButton>
        </div>
      }
    >
      <div className="admin-form-stack">
        {question ? (
          <AdminDetailSection title="Record">
            <AdminDetailGrid>
              <AdminDetailField
                label="Status"
                value={<DiscoveryQaStatusBadge status={question.status} />}
              />
              <AdminDetailField label="Author" value={question.authorUsername} />
              <AdminDetailField label="Answers" value={question.answerCount.toLocaleString()} />
              <AdminDetailField
                label="Created"
                value={formatDiscoveryDateTime(question.createdAt)}
              />
              <AdminDetailField
                label="Updated"
                value={formatDiscoveryDateTime(question.updatedAt)}
              />
              <AdminDetailField label="Question ID" value={question.questionId} mono />
            </AdminDetailGrid>
          </AdminDetailSection>
        ) : null}

        {canWrite ? (
          <form
            id="discovery-question-form"
            className="admin-form-stack"
            onSubmit={(event) => {
              void onSubmit(event);
            }}
          >
            <div className="admin-form-grid">
              <Controller
                control={form.control}
                name="category"
                render={({ field, fieldState }) => (
                  <AlSelect
                    label="Category"
                    options={QA_CATEGORY_OPTIONS}
                    value={field.value}
                    data-testid="discovery-qa-category"
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                      field.onChange(event.target.value);
                    }}
                    errorText={fieldState.error?.message}
                    disabled={isBusy}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="kind"
                render={({ field, fieldState }) => (
                  <AlSelect
                    label="Kind"
                    options={QA_KIND_OPTIONS}
                    value={field.value}
                    data-testid="discovery-qa-kind"
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                      field.onChange(event.target.value);
                    }}
                    errorText={fieldState.error?.message}
                    disabled={isBusy}
                  />
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <AlInput
                  label="Title"
                  data-testid="discovery-qa-title"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  errorText={fieldState.error?.message}
                  autoComplete="off"
                  disabled={isBusy}
                />
              )}
            />

            <Controller
              control={form.control}
              name="body"
              render={({ field, fieldState }) => (
                <DiscoveryTextArea
                  label="Body"
                  data-testid="discovery-qa-body"
                  rows={6}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  errorText={fieldState.error?.message}
                  helperText="Optional context shown under the title in the app."
                  disabled={isBusy}
                />
              )}
            />

            <Controller
              control={form.control}
              name="vehicleLabel"
              render={({ field, fieldState }) => (
                <AlInput
                  label="Vehicle label"
                  data-testid="discovery-qa-vehicle"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  errorText={fieldState.error?.message}
                  helperText="Optional — e.g. “Maruti Swift 2019”."
                  autoComplete="off"
                  disabled={isBusy}
                />
              )}
            />

            {!isEdit ? (
              <Controller
                control={form.control}
                name="publishNow"
                render={({ field }) => (
                  <AlCheckbox
                    label="Publish immediately"
                    helperText="Off = saved hidden (draft). On = visible in the consumer feed as soon as it is created."
                    checked={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.checked);
                    }}
                  />
                )}
              />
            ) : null}

            {submitError ? <p className="admin-form-error">{submitError}</p> : null}
          </form>
        ) : question ? (
          <AdminDetailSection title="Content">
            <AdminDetailGrid>
              <AdminDetailField label="Title" value={question.title} />
              <AdminDetailField label="Category" value={question.category} />
              <AdminDetailField label="Kind" value={question.kind} />
              <AdminDetailField label="Vehicle" value={question.vehicleLabel ?? '—'} />
              <AdminDetailField label="Body" value={question.body || '—'} />
            </AdminDetailGrid>
          </AdminDetailSection>
        ) : null}
      </div>
    </AlModal>
  );
}
