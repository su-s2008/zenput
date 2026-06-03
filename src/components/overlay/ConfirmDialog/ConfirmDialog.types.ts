import React from 'react';
import type { DialogSize } from '../Dialog';

export type ConfirmDialogTone = 'default' | 'danger';

export interface ConfirmDialogProps {
  /** Controlled open state. */
  open: boolean;
  /** Called whenever the dialog requests to close (cancel, backdrop click, Escape, or after a successful confirm). */
  onOpenChange: (open: boolean) => void;
  /** Heading shown at the top of the dialog. */
  title: React.ReactNode;
  /** Body content explaining the action. Pass a string or a ReactNode. */
  description?: React.ReactNode;
  /** Label for the confirm button. Defaults to 'Confirm'. */
  confirmLabel?: string;
  /** Label for the cancel button. Defaults to 'Cancel'. */
  cancelLabel?: string;
  /**
   * Called when the user confirms. May return a Promise. While the Promise is
   * pending, the confirm button shows a spinner and the cancel button is disabled.
   * After it resolves, the dialog is closed. If it rejects, the dialog stays open
   * and the loading state is cleared so the parent can render an error (e.g. via Alert).
   */
  onConfirm: () => void | Promise<void>;
  /** Visual tone. `danger` switches the confirm button to the destructive variant. Defaults to 'default'. */
  tone?: ConfirmDialogTone;
  /** Dialog size. Defaults to 'sm'. */
  size?: DialogSize;
  /** Disables the confirm button (e.g. when a required field is empty). */
  confirmDisabled?: boolean;
  /** Optional extra content rendered between the description and the action buttons (e.g. a "type DELETE" input). */
  children?: React.ReactNode;
  /** Optional icon rendered before the title. */
  icon?: React.ReactNode;
}
