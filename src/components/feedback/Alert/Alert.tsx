'use client';
import React from 'react';
import { classNames } from '../../../utils';
import type { AlertProps, AlertTone } from './Alert.types';
import styles from './Alert.module.css';

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
      width="100%"
      height="100%"
    >
      <circle cx="10" cy="10" r="8" />
      <line x1="10" y1="9" x2="10" y2="14" strokeLinecap="round" />
      <circle cx="10" cy="6" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
      width="100%"
      height="100%"
    >
      <circle cx="10" cy="10" r="8" />
      <polyline points="6.5 10.5 9 13 13.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
      width="100%"
      height="100%"
    >
      <path d="M10 2.5L18.5 17.5H1.5L10 2.5Z" strokeLinejoin="round" />
      <line x1="10" y1="8" x2="10" y2="12" strokeLinecap="round" />
      <circle cx="10" cy="14.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
      width="100%"
      height="100%"
    >
      <circle cx="10" cy="10" r="8" />
      <line x1="7" y1="7" x2="13" y2="13" strokeLinecap="round" />
      <line x1="13" y1="7" x2="7" y2="13" strokeLinecap="round" />
    </svg>
  );
}

function NeutralIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
      width="100%"
      height="100%"
    >
      <circle cx="10" cy="10" r="8" />
    </svg>
  );
}

const DEFAULT_ICONS: Record<AlertTone, React.ReactNode> = {
  info: <InfoIcon />,
  success: <SuccessIcon />,
  warning: <WarningIcon />,
  error: <ErrorIcon />,
  neutral: <NeutralIcon />,
};

function DismissIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
      width="14"
      height="14"
    >
      <line x1="4" y1="4" x2="12" y2="12" strokeLinecap="round" />
      <line x1="12" y1="4" x2="4" y2="12" strokeLinecap="round" />
    </svg>
  );
}

function resolveIcon(icon: AlertProps['icon'], tone: AlertTone): React.ReactNode {
  // `??` would treat `null` the same as `undefined`. We deliberately allow
  // callers to pass `null` to suppress the default icon.
  if (icon === undefined) return DEFAULT_ICONS[tone];
  return icon;
}

/**
 * Persistent inline banner for page-level feedback (errors, warnings, info,
 * success). Unlike `Toast` (which auto-dismisses) `Alert` stays visible until
 * the parent removes it or the user clicks the optional dismiss button.
 *
 * Use `tone` for semantic meaning, `variant` for visual emphasis, and the
 * `action` slot for inline CTAs like "Retry".
 */
export function Alert({
  tone = 'info',
  variant = 'subtle',
  title,
  children,
  icon,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  assertive,
  className,
  style,
}: Readonly<AlertProps>): React.ReactElement {
  const isAssertive = assertive ?? tone === 'error';
  const role = isAssertive ? 'alert' : 'status';
  const ariaLive = isAssertive ? 'assertive' : 'polite';

  const resolvedIcon = resolveIcon(icon, tone);

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={classNames(
        styles.alert,
        styles[`tone-${tone}`],
        styles[`variant-${variant}`],
        className
      )}
      style={style}
    >
      {resolvedIcon ? <span className={styles.icon}>{resolvedIcon}</span> : null}
      <div className={styles.body}>
        {title ? <span className={styles.title}>{title}</span> : null}
        {children ? <div className={styles.description}>{children}</div> : null}
      </div>
      {action ? <span className={styles.action}>{action}</span> : null}
      {onDismiss ? (
        <button
          type="button"
          className={styles.dismiss}
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          <DismissIcon />
        </button>
      ) : null}
    </div>
  );
}

Alert.displayName = 'Alert';
