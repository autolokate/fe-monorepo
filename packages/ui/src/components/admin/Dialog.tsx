import * as Dialog from '@radix-ui/react-dialog';
import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { AlButton } from '../primitives/Button/index';
import { AlHeading, AlStack, AlText } from '../primitives/index';
import './Dialog.css';

export type AlModalSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Radix only returns focus to its own `Dialog.Trigger`. Admin dialogs are opened from state (a
 * table row, a row action), so on close focus fell to <body> and keyboard users lost their place.
 * Remember what had focus when the dialog opened (layout effect = before Radix moves focus into
 * the content) and put it back on close while it is still in the document.
 */
function useReturnFocus(open: boolean) {
  const returnTo = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (open && typeof document !== 'undefined') {
      const active = document.activeElement;
      returnTo.current = active instanceof HTMLElement && active !== document.body ? active : null;
    }
  }, [open]);
  return (event: Event) => {
    const target = returnTo.current;
    returnTo.current = null;
    if (target?.isConnected) {
      event.preventDefault();
      target.focus();
    }
  };
}

export type AlModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: AlModalSize;
};

/** Centered dialog for admin create/edit/detail flows. */
export function AlModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
}: AlModalProps) {
  const onCloseAutoFocus = useReturnFocus(open);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="al-dialog-overlay" />
        <Dialog.Content
          className={`al-modal al-modal--${size}`}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <div className="al-modal__header">
            <AlStack gap="xs">
              <Dialog.Title asChild>
                <AlHeading variant="h4">{title}</AlHeading>
              </Dialog.Title>
              {description ? (
                <Dialog.Description asChild>
                  <AlText tone="muted">{description}</AlText>
                </Dialog.Description>
              ) : null}
            </AlStack>
          </div>
          <div className="al-modal__body">{children}</div>
          {footer ? <div className="al-modal__footer">{footer}</div> : null}
          <Dialog.Close asChild>
            <button
              type="button"
              className="al-dialog-close al-admin-focus-ring"
              aria-label="Close dialog"
            >
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type AlSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'right' | 'left';
};

/** Side panel built on Radix Dialog (shadcn Sheet pattern). */
export function AlSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = 'right',
}: AlSheetProps) {
  const onCloseAutoFocus = useReturnFocus(open);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="al-dialog-overlay" />
        <Dialog.Content
          className={`al-sheet al-sheet--${side}`}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <AlStack gap="sm">
            <Dialog.Title asChild>
              <AlHeading variant="h4">{title}</AlHeading>
            </Dialog.Title>
            {description ? (
              <Dialog.Description asChild>
                <AlText tone="muted">{description}</AlText>
              </Dialog.Description>
            ) : null}
          </AlStack>
          <div className="al-sheet__body">{children}</div>
          {footer ? <div className="al-sheet__footer">{footer}</div> : null}
          <Dialog.Close asChild>
            <button
              type="button"
              className="al-dialog-close al-admin-focus-ring"
              aria-label="Close panel"
            >
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type AlConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
};

export function AlConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
}: AlConfirmationDialogProps) {
  const onCloseAutoFocus = useReturnFocus(open);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="al-dialog-overlay" />
        <Dialog.Content
          className="al-dialog-content"
          role="alertdialog"
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <AlStack gap="sm">
            <Dialog.Title asChild>
              <AlHeading variant="h4">{title}</AlHeading>
            </Dialog.Title>
            <Dialog.Description asChild>
              <AlText tone="muted">{description}</AlText>
            </Dialog.Description>
          </AlStack>
          <div className="al-dialog-actions">
            <AlButton
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={() => {
                onOpenChange(false);
              }}
            >
              {cancelLabel}
            </AlButton>
            <AlButton
              variant={destructive ? 'destructive' : 'primary'}
              size="sm"
              loading={loading}
              disabled={loading}
              onClick={onConfirm}
            >
              {confirmLabel}
            </AlButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const AlDeleteDialog = AlConfirmationDialog;
