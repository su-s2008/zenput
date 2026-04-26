import React from 'react';
import { classNames } from '../../utils';
import type { EmptyStateAction, EmptyStateProps } from './EmptyState.types';
import styles from './EmptyState.module.css';

const SIZE_CLASS: Record<NonNullable<EmptyStateProps['size']>, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const VARIANT_CLASS: Record<NonNullable<EmptyStateProps['variant']>, string> = {
  default: '',
  search: styles.variantSearch,
  error: styles.variantError,
};

function ActionNode({ action, primary }: { action: EmptyStateAction; primary: boolean }) {
  const cls = primary ? styles.primaryAction : styles.secondaryAction;
  if (action.onClick) {
    return (
      <button type="button" className={cls} onClick={action.onClick}>
        {action.label}
      </button>
    );
  }
  if (action.href) {
    return (
      <a href={action.href} className={cls}>
        {action.label}
      </a>
    );
  }
  // Neither onClick nor href provided; nothing actionable to render.
  return null;
}

/**
 * Full-bleed empty-state placeholder. Used when a list, table, or search
 * yields no results. Supports icons, titles, descriptions, and CTA buttons.
 */
export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  size = 'md',
  variant = 'default',
  className,
  style,
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      className={classNames(styles.emptyState, SIZE_CLASS[size], VARIANT_CLASS[variant], className)}
      style={style}
      role="status"
      aria-live="polite"
    >
      {icon && <div className={styles.icon}>{icon}</div>}

      <p className={styles.title}>{title}</p>

      {description && <p className={styles.description}>{description}</p>}

      {(primaryAction ?? secondaryAction) && (
        <div className={styles.actions}>
          {primaryAction && <ActionNode action={primaryAction} primary />}
          {secondaryAction && <ActionNode action={secondaryAction} primary={false} />}
        </div>
      )}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';
