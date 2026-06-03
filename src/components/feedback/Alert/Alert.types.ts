import React from 'react';

export type AlertTone = 'info' | 'success' | 'warning' | 'error' | 'neutral';
export type AlertVariant = 'subtle' | 'solid' | 'outline';

export interface AlertProps {
  /** Semantic tone. Defaults to 'info'. */
  tone?: AlertTone;
  /** Visual variant. Defaults to 'subtle'. */
  variant?: AlertVariant;
  /** Optional bold title rendered above the description. */
  title?: React.ReactNode;
  /** Description / body content. */
  children?: React.ReactNode;
  /** Optional leading icon. When omitted a tone-appropriate default icon is rendered. Pass `null` to suppress. */
  icon?: React.ReactNode | null;
  /** Action slot rendered at the trailing end (e.g. Retry button). */
  action?: React.ReactNode;
  /**
   * When provided, renders a close button. Called when the user dismisses the alert.
   * The component does not unmount itself — the parent controls visibility.
   */
  onDismiss?: () => void;
  /** Accessible label for the dismiss button. Defaults to 'Dismiss'. */
  dismissLabel?: string;
  /**
   * When true, uses `role="alert"` (assertive) instead of `role="status"` (polite).
   * Defaults to `true` for `error` tone and `false` otherwise.
   */
  assertive?: boolean;
  /** Additional CSS class applied to the root element. */
  className?: string;
  /** Additional inline style applied to the root element. */
  style?: React.CSSProperties;
}
