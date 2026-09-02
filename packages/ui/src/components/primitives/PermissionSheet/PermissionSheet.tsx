import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { AlButton } from '../Button/Button';
import { cn } from '../../../utils/cn';

import type { AlPermissionSheetProps } from './PermissionSheet.types';
import './PermissionSheet.css';

/** Figma 1049:2422 · 1110:2471 · 1113:2486 — permission / confirm sheets. */
export function AlPermissionSheet({
  open,
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onDismiss,
  children,
}: AlPermissionSheetProps) {
  const [visible, setVisible] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      setSettled(false);
      return;
    }

    setVisible(true);
    setSettled(false);
    const timer = window.setTimeout(() => {
      setSettled(true);
    }, 320);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const sheet = (
    <div
      className={cn(
        'al-permission-sheet',
        visible && 'al-permission-sheet--open',
        settled && 'al-permission-sheet--settled',
      )}
      role="presentation"
    >
      <button
        type="button"
        className="al-permission-sheet__scrim"
        aria-label="Dismiss"
        onClick={onDismiss}
      />
      <div
        className="al-permission-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="al-permission-sheet-title"
      >
        <div className="al-permission-sheet__handle" aria-hidden />
        <h2 id="al-permission-sheet-title" className="al-permission-sheet__title">
          {title}
        </h2>
        {description ? <p className="al-permission-sheet__description">{description}</p> : null}
        {children ? <div className="al-permission-sheet__body">{children}</div> : null}
        <div className="al-permission-sheet__actions">
          <AlButton variant="primary" onClick={onPrimary}>
            {primaryLabel}
          </AlButton>
          {secondaryLabel && onSecondary ? (
            <button type="button" className="al-permission-sheet__secondary" onClick={onSecondary}>
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
