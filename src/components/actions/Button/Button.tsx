import React, { forwardRef } from 'react';
import { classNames } from '../../../utils';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'subtle'
  | 'outline'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  /** Visual variant. Default: `'primary'`. */
  variant?: ButtonVariant;
  /** Size. Default: `'md'`. */
  size?: ButtonSize;
  /** Icon rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the label. */
  rightIcon?: React.ReactNode;
  /** When true, shows a spinner and marks the button busy/disabled. */
  loading?: boolean;
  /**
   * Optional localized accessible label to announce while `loading` is
   * true. When set, it overrides the button's content-derived name via
   * `aria-label` while loading. Leave unset to keep the content as the
   * accessible name. */
  loadingLabel?: string;
  /** Span the full available width. */
  fullWidth?: boolean;
  className?: string;
}

export type ButtonProps =
  | ({ iconOnly: true; 'aria-label': string } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & ButtonBaseProps)
  | ({ iconOnly?: false } & React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonBaseProps);

/**
 * Primary action primitive. Six variants (primary, secondary, subtle,
 * outline, ghost, danger), three sizes, icon slots, `iconOnly` and
 * `loading` states.
 *
 * While `loading` is true the button is both `disabled` and
 * `aria-busy="true"`. The content is visually hidden (via a
 * visually-hidden style so the label is still exposed to assistive
 * tech) and a decorative spinner is rendered. Pass `loadingLabel` to
 * override the accessible name with a localized "loading" phrase.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    iconOnly,
    loading,
    loadingLabel,
    fullWidth,
    disabled,
    type = 'button',
    className,
    children,
    'aria-busy': ariaBusy,
    'aria-label': ariaLabel,
    ...rest
  },
  ref
) {
  const isDisabled = Boolean(disabled || loading);
  const resolvedAriaLabel = loading && loadingLabel ? loadingLabel : ariaLabel;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading ? true : ariaBusy}
      aria-label={resolvedAriaLabel}
      className={classNames(
        styles.button,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        iconOnly ? styles.iconOnly : undefined,
        fullWidth ? styles.fullWidth : undefined,
        className
      )}
      {...rest}
    >
      {loading && (
        <span
          className={styles.spinner}
          aria-hidden="true"
          data-testid="button-spinner"
        />
      )}
      <span
        className={classNames(loading ? styles.contentHidden : undefined)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'inherit' }}
      >
        {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        {children}
        {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </span>
    </button>
  );
});