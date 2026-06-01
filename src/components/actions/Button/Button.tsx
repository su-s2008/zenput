'use client';
import React, { forwardRef } from 'react';
import { classNames } from '../../../utils';
import { Slot } from '../../../utils/slot';
import { Spinner } from '../../feedback/Spinner';
import type { PolymorphicProps, PolymorphicRef } from '../../../types/polymorphic';
import { createPolymorphicComponent } from '../../../types/polymorphic';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'outline' | 'ghost' | 'danger' | 'destructive';
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

type ButtonComponent = <C extends React.ElementType = 'button'>(
  props: (
    | ({ iconOnly: true; 'aria-label': string } & PolymorphicProps<C, ButtonBaseProps>)
    | ({ iconOnly?: false } & PolymorphicProps<C, ButtonBaseProps>)
  ) & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null;

// Legacy exported type for backward compatibility.
export type ButtonProps =
  | ({ iconOnly: true; 'aria-label': string } & Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      'aria-label'
    > &
      ButtonBaseProps)
  | ({ iconOnly?: false } & React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonBaseProps);

/**
 * Primary action primitive. Six variants (primary, secondary, subtle,
 * outline, ghost, danger), three sizes, icon slots, `iconOnly` and
 * `loading` states.
 *
 * Polymorphic via `as` (e.g. `as="a"`) or `asChild` (Radix-style
 * merging onto a single child: `<Button asChild><NextLink …/></Button>`).
 *
 * While `loading` is true the button is both `disabled` and
 * `aria-busy="true"`. The content is visually hidden (via a
 * visually-hidden style so the label is still exposed to assistive
 * tech) and a decorative spinner is rendered. Pass `loadingLabel` to
 * override the accessible name with a localized "loading" phrase.
 */
export const Button = createPolymorphicComponent<ButtonComponent>(
  forwardRef(function Button(
  {
    as,
    asChild,
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    iconOnly,
    loading,
    loadingLabel,
    fullWidth,
    disabled,
    type,
    className,
    children,
    'aria-busy': ariaBusy,
    'aria-label': ariaLabel,
    ...rest
  }: PolymorphicProps<
    React.ElementType,
    ButtonBaseProps & {
      iconOnly?: boolean;
      disabled?: boolean;
      type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
      'aria-busy'?: React.AriaAttributes['aria-busy'];
      'aria-label'?: string;
    }
  >,
  ref: React.ForwardedRef<Element>
) {
  const isDisabled = Boolean(disabled || loading);
  const resolvedAriaLabel = loading && loadingLabel ? loadingLabel : ariaLabel;

  const buttonClassName = classNames(
    styles.button,
  styles[\variant-${variant === 'destructive' ? 'danger' : variant}`],
    styles[`size-${size}`],
    iconOnly ? styles.iconOnly : undefined,
    fullWidth ? styles.fullWidth : undefined,
    className
  );

  // asChild: merge button styles onto the single child element.
  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={buttonClassName}
        aria-busy={loading ? true : ariaBusy}
        aria-label={resolvedAriaLabel}
        {...(isDisabled ? { 'aria-disabled': true, 'data-disabled': '' } : {})}
        {...rest}
      >
        {children}
      </Slot>
    );
  }

  const Component: React.ElementType = as ?? 'button';
  const isNativeButton = Component === 'button';

  let extraButtonProps: Record<string, unknown>;
  if (isNativeButton) {
    extraButtonProps = { type: type ?? 'button', disabled: isDisabled };
  } else if (isDisabled) {
    extraButtonProps = { 'aria-disabled': true, 'data-disabled': '' };
  } else {
    extraButtonProps = {};
  }

  return (
    <Component
      ref={ref}
      {...extraButtonProps}
      aria-busy={loading ? true : ariaBusy}
      aria-label={resolvedAriaLabel}
      className={buttonClassName}
      {...rest}
    >
      {loading && (
        <Spinner
          size="sm"
          label=""
          className={styles.spinner}
          data-testid="button-spinner"
          aria-hidden="true"
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
    </Component>
  );
}),
'Button'
);
