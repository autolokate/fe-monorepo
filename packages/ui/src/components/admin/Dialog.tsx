import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

import { AlButton } from '../primitives/Button/index';
import { AlHeading, AlStack, AlText } from '../primitives/index';
import './Dialog.css';

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
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="al-dialog-overlay" />
        <Dialog.Content className={`al-sheet al-sheet--${side}`}>
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
            <button type="button" className="al-dialog-close al-admin-focus-ring" aria-label="Close panel">
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
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="al-dialog-overlay" />
        <Dialog.Content className="al-dialog-content" role="alertdialog">
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
