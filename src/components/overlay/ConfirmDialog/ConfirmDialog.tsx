'use client';
import React, { useCallback, useState } from 'react';
import { classNames } from '../../../utils';
import { Button } from '../../actions/Button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../Dialog';
import type { ConfirmDialogProps, ConfirmDialogTone } from './ConfirmDialog.types';
import styles from './ConfirmDialog.module.css';

const CONFIRM_VARIANT: Record<ConfirmDialogTone, 'primary' | 'danger'> = {
  default: 'primary',
  danger: 'danger',
};

/**
 * Pre-composed confirmation dialog for destructive or significant actions.
 *
 * Handles the async-confirm pattern (spinner on the confirm button while
 * `onConfirm` is pending, dialog stays open on rejection so the parent can
 * surface an error). Built on top of the headless `Dialog` primitive.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  tone = 'default',
  size = 'sm',
  confirmDisabled = false,
  children,
  icon,
}: Readonly<ConfirmDialogProps>): React.ReactElement {
  const [loading, setLoading] = useState(false);

  // Reset `loading` whenever the dialog transitions from open to closed,
  // including parent-driven external closes. Uses the React "store previous
  // prop" pattern (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
  // so we never reset state from inside an effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) setLoading(false);
  }

  // Route internal closes (success, cancel, overlay, escape) through this
  // wrapper. The prev-prop check above handles externally-driven closes.
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) setLoading(false);
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  const handleConfirm = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onConfirm();
      handleOpenChange(false);
    } catch {
      // Keep the dialog open so the parent can render an error.
      setLoading(false);
    }
  }, [loading, onConfirm, handleOpenChange]);

  const handleCancel = useCallback(() => {
    if (loading) return;
    handleOpenChange(false);
  }, [loading, handleOpenChange]);

  const hasBody = Boolean(description || children);

  let body: React.ReactNode = null;
  if (description) {
    body = (
      <DialogBody>
        <DialogDescription>{description}</DialogDescription>
        {children}
      </DialogBody>
    );
  } else if (children) {
    body = <DialogBody>{children}</DialogBody>;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <DialogContent size={size} className={classNames(styles[`tone-${tone}`])}>
        <DialogHeader>
          <div className={styles.titleRow}>
            {icon ? <span className={styles.icon}>{icon}</span> : null}
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        {hasBody ? body : null}
        <DialogFooter>
          <Button variant="ghost" onClick={handleCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={CONFIRM_VARIANT[tone]}
            onClick={handleConfirm}
            loading={loading}
            disabled={confirmDisabled || loading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

ConfirmDialog.displayName = 'ConfirmDialog';
