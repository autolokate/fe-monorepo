import type { KeyboardEvent } from 'react';
import type { FieldErrors, FieldValues, UseFormReturn } from 'react-hook-form';
import { useCallback, useRef } from 'react';

export function focusFirstInvalidField<T extends FieldValues>(
  errors: FieldErrors<T>,
  formRoot?: HTMLElement | null,
): void {
  const firstKey = Object.keys(errors)[0];
  if (!firstKey) {
    return;
  }

  const root = formRoot ?? document.activeElement?.closest('form');
  const field =
    root?.querySelector<HTMLElement>(`[name="${firstKey}"]`) ??
    root?.querySelector<HTMLElement>(`[id="${firstKey}"]`);

  if (field) {
    field.focus();
    field.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

export function useAdminFormSubmit<T extends FieldValues>({
  form,
  isPending,
  onValid,
}: {
  form: UseFormReturn<T>;
  isPending: boolean;
  onValid: (values: T) => Promise<void> | void;
}) {
  const submittingRef = useRef(false);

  const onSubmit = form.handleSubmit(
    async (values) => {
      if (isPending || submittingRef.current) {
        return;
      }
      submittingRef.current = true;
      try {
        await onValid(values);
      } finally {
        submittingRef.current = false;
      }
    },
    (errors) => {
      focusFirstInvalidField(errors, document.activeElement?.closest('form'));
    },
  );

  const handleFormKeyDown = useCallback(
    (event: KeyboardEvent<HTMLFormElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        const target = event.target;
        if (target instanceof HTMLTextAreaElement) {
          return;
        }
        event.preventDefault();
        void onSubmit(event);
      }
    },
    [onSubmit],
  );

  return { onSubmit, handleFormKeyDown, isSubmitting: isPending || submittingRef.current };
}
