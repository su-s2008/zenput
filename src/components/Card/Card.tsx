import React from 'react';
import { classNames } from '../../utils';
import type {
  CardBodyProps,
  CardFooterProps,
  CardHeaderProps,
  CardMediaProps,
  CardProps,
} from './Card.types';
import styles from './Card.module.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VARIANT_CLASS: Record<NonNullable<CardProps['variant']>, string> = {
  outlined: styles.variantOutlined,
  elevated: styles.variantElevated,
  filled: styles.variantFilled,
};

const PADDING_CLASS: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
};

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

/**
 * Surface container. Supports outlined, elevated, and filled visual variants
 * and an optional interactive mode that renders the card as a `<button>` or
 * `<a>` with hover/focus styles.
 */
export function Card({
  as,
  variant = 'outlined',
  interactive = false,
  padding = 'none',
  className,
  style,
  children,
  onClick,
  href,
  tabIndex,
  type,
}: CardProps): React.ReactElement {
  const Component: React.ElementType = as ?? (interactive ? (href ? 'a' : 'button') : 'div');

  // Only forward `href` when rendering an `<a>` (or a custom component which
  // may consume it); only forward `type` when rendering a native `<button>` so
  // React doesn't warn about invalid DOM attributes. Default `type` to
  // `'button'` for native buttons to prevent accidental form submission.
  const isAnchor = Component === 'a';
  const isNativeButton = Component === 'button';
  const extraProps: Record<string, unknown> = {};
  if (isAnchor || (typeof Component !== 'string' && href !== undefined)) {
    extraProps.href = href;
  }
  if (isNativeButton) {
    extraProps.type = type ?? 'button';
  }

  return (
    <Component
      className={classNames(
        styles.card,
        VARIANT_CLASS[variant],
        interactive ? styles.interactive : undefined,
        PADDING_CLASS[padding],
        className
      )}
      style={style}
      onClick={onClick}
      tabIndex={interactive ? (tabIndex ?? 0) : tabIndex}
      {...extraProps}
    >
      {children}
    </Component>
  );
}

Card.displayName = 'Card';

// ---------------------------------------------------------------------------
// CardHeader
// ---------------------------------------------------------------------------

/**
 * Optional header section with title, description, leading avatar, and
 * trailing action slot.
 */
export function CardHeader({
  title,
  description,
  action,
  avatar,
  className,
  style,
}: CardHeaderProps): React.ReactElement {
  return (
    <div className={classNames(styles.header, className)} style={style}>
      {avatar && <div className={styles.headerAvatar}>{avatar}</div>}
      <div className={styles.headerContent}>
        <p className={styles.headerTitle}>{title}</p>
        {description && <p className={styles.headerDescription}>{description}</p>}
      </div>
      {action && <div className={styles.headerAction}>{action}</div>}
    </div>
  );
}

CardHeader.displayName = 'CardHeader';

// ---------------------------------------------------------------------------
// CardMedia
// ---------------------------------------------------------------------------

/** Full-width image section that preserves aspect ratio. */
export function CardMedia({
  src,
  alt = '',
  aspectRatio = 16 / 9,
  className,
  style,
}: CardMediaProps): React.ReactElement {
  // Use padding-bottom trick for intrinsic aspect-ratio reservation. Guard
  // against zero/negative/non-finite values which would produce broken layout.
  const safeAspectRatio = Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 16 / 9;
  const paddingBottom = `${(1 / safeAspectRatio) * 100}%`;

  return (
    <div className={classNames(styles.media, className)} style={style}>
      <div className={styles.mediaInner} style={{ paddingBottom }}>
        <img src={src} alt={alt} className={styles.mediaImg} loading="lazy" />
      </div>
    </div>
  );
}

CardMedia.displayName = 'CardMedia';

// ---------------------------------------------------------------------------
// CardBody
// ---------------------------------------------------------------------------

/** Main content area. */
export function CardBody({ className, style, children }: CardBodyProps): React.ReactElement {
  return (
    <div className={classNames(styles.body, className)} style={style}>
      {children}
    </div>
  );
}

CardBody.displayName = 'CardBody';

// ---------------------------------------------------------------------------
// CardFooter
// ---------------------------------------------------------------------------

/** Optional footer section for actions or metadata. */
export function CardFooter({ className, style, children }: CardFooterProps): React.ReactElement {
  return (
    <div className={classNames(styles.footer, className)} style={style}>
      {children}
    </div>
  );
}

CardFooter.displayName = 'CardFooter';
