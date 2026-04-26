import React, { forwardRef } from 'react';
import { classNames } from '../../../utils';
import { Button } from '../Button';
import styles from './Tag.module.css';

export type TagColor = 'brand' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
export type TagVariant = 'solid' | 'subtle' | 'outline';
export type TagSize = 'sm' | 'md' | 'lg';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic color. Default: `'neutral'`. */
  color?: TagColor;
  /** Visual variant. Default: `'subtle'`. */
  variant?: TagVariant;
  /** Size. Default: `'md'`. */
  size?: TagSize;
  /** Icon rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Called when the remove button is clicked. When provided, a close button is shown. */
  onRemove?: () => void;
  /** Accessible label for the remove button. Default: `'Remove'`. */
  removeLabel?: string;
  /** When true, applies interactive (hover/focus) styles. */
  interactive?: boolean;
  className?: string;
}

/**
 * Interactive / closable tag / chip primitive. Distinct from `Badge` which is
 * read-only. Supports six semantic colors, three visual variants, and an
 * optional close button.
 *
 * The close button is an icon-only ghost `Button` — reusing the existing
 * button primitive so focus/keyboard behavior is consistent.
 *
 * **Accessibility**: when both `interactive`/`onClick` and `onRemove` are
 * provided, the wrapper would normally nest an interactive `<button>` (remove)
 * inside a `role="button"` element, which is invalid. In that case the inner
 * label is rendered as its own real `<button>`, so the label-button and the
 * remove-button sit as siblings inside a non-interactive `<span>` wrapper.
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  {
    color = 'neutral',
    variant = 'subtle',
    size = 'md',
    leftIcon,
    onRemove,
    removeLabel = 'Remove',
    interactive,
    className,
    children,
    onClick,
    ...rest
  },
  ref
) {
  const isInteractive = interactive || Boolean(onClick);
  // To avoid nested interactive controls (a `<button>` inside a `role="button"`
  // span), when the tag is both interactive and removable we promote the label
  // region to a real `<button>` and keep the wrapper non-interactive.
  const useNestedButtons = isInteractive && Boolean(onRemove);

  const wrapperClass = classNames(
    styles.tag,
    styles[`color-${color}`],
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    isInteractive ? styles.interactive : undefined,
    className
  );

  const labelContent = (
    <>
      {leftIcon && (
        <span className={styles.leftIcon} aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className={styles.label}>{children}</span>
    </>
  );

  const removeButton = onRemove && (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={removeLabel}
      className={styles.removeBtn}
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    >
      <span aria-hidden="true">✕</span>
    </Button>
  );

  if (useNestedButtons) {
    // Sibling layout: label-button and remove-button are siblings inside a
    // non-interactive wrapper so neither is nested inside another interactive.
    return (
      <span ref={ref} className={wrapperClass} {...rest}>
        <button
          type="button"
          className={styles.activator}
          onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
        >
          {labelContent}
        </button>
        {removeButton}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={wrapperClass}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Trigger activation through the DOM so consumers' onClick
                // receives a real MouseEvent (instead of casting the keyboard
                // event, which would expose undefined mouse-only fields).
                e.currentTarget.click();
              }
            }
          : undefined
      }
      {...rest}
    >
      {labelContent}
      {removeButton}
    </span>
  );
});
Tag.displayName = 'Tag';

/**
 * `Chip` is an alias for `Tag` to match alternative naming conventions.
 */
export const Chip = Tag;
