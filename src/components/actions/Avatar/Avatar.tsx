import React, { forwardRef, useState } from 'react';
import { classNames } from '../../../utils';
import styles from './Avatar.module.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'square';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Image source URL. */
  src?: string;
  /** Full name used for initials and the img `alt` attribute. */
  name?: string;
  /** Avatar size. Default: `'md'`. */
  size?: AvatarSize;
  /** Avatar shape. Default: `'circle'`. */
  shape?: AvatarShape;
  /** Presence status indicator. */
  status?: AvatarStatus;
  /** Fallback icon rendered when no image and no name are available. */
  fallbackIcon?: React.ReactNode;
  /** Derive a deterministic background color from the name. Default: `false`. */
  colorByName?: boolean;
  className?: string;
}

const BG_COLORS = [
  '#4338ca', // indigo-700
  '#6d28d9', // violet-700
  '#be185d', // pink-700
  '#b91c1c', // red-700
  '#b45309', // amber-700
  '#047857', // emerald-700
  '#0369a1', // sky-700
  '#0e7490', // cyan-700
  '#15803d', // green-700
  '#7e22ce', // purple-700
];

/** Derive initials (up to 2 chars) from a display name. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Deterministic index into BG_COLORS based on the name string. */
function colorIndexFromName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return Math.abs(hash) % BG_COLORS.length;
}

/**
 * Displays a user avatar with image, initials, or a fallback icon.
 *
 * - Auto-derives initials from `name`.
 * - `colorByName` selects a deterministic background color.
 * - Failed image hides gracefully and falls back to initials/icon.
 * - Optional `status` indicator (online, offline, away, busy).
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    src,
    name,
    size = 'md',
    shape = 'circle',
    status,
    fallbackIcon,
    colorByName = false,
    className,
    style,
    ...rest
  },
  ref
) {
  const [imgError, setImgError] = useState(false);
  const showImg = Boolean(src) && !imgError;
  const initials = name ? getInitials(name) : undefined;

  const bgColor = colorByName && name ? BG_COLORS[colorIndexFromName(name)] : undefined;

  // Build an accessible label that includes both name and status so screen
  // readers announce the full context (e.g. "Ada Lovelace, online").
  const accessibleLabel = name && status ? `${name}, ${status}` : (name ?? undefined);

  // Allow the consumer to provide their own label via `aria-label`; fall back
  // to the derived `accessibleLabel`. Only apply `role="img"` when we end up
  // with *some* accessible name, otherwise we'd produce an unlabeled image
  // role (a11y failure).
  const consumerAriaLabel = (rest as { 'aria-label'?: string })['aria-label'];
  const finalAriaLabel = consumerAriaLabel ?? accessibleLabel;
  const applyImgRole = Boolean(finalAriaLabel);

  return (
    <span
      ref={ref}
      className={classNames(
        styles.avatar,
        styles[`size-${size}`],
        styles[`shape-${shape}`],
        className
      )}
      style={bgColor && !showImg ? { ...style, backgroundColor: bgColor, color: '#fff' } : style}
      aria-label={applyImgRole ? finalAriaLabel : undefined}
      role={applyImgRole ? 'img' : undefined}
      {...rest}
    >
      {showImg ? (
        // When the wrapper exposes `role="img"` with an accessible name, the
        // inner `<img>` must be decorative to avoid duplicate announcements.
        // Otherwise (no wrapper label), let the `<img alt>` carry the label.
        <img
          src={src}
          alt={applyImgRole ? '' : (name ?? '')}
          aria-hidden={applyImgRole ? 'true' : undefined}
          className={styles.img}
          onError={() => setImgError(true)}
        />
      ) : initials ? (
        <span className={styles.initials} aria-hidden="true">
          {initials}
        </span>
      ) : (
        <span className={styles.fallback} aria-hidden="true">
          {fallbackIcon}
        </span>
      )}
      {status && (
        <span
          className={classNames(styles.status, styles[`status-${status}`])}
          aria-hidden="true"
        />
      )}
    </span>
  );
});
Avatar.displayName = 'Avatar';

// ---------------------------------------------------------------------------
// AvatarGroup
// ---------------------------------------------------------------------------

export interface AvatarGroupProps {
  /** Maximum number of avatars to show before overflow indicator. */
  max?: number;
  /** Size applied to all child avatars. Overrides individual avatar size. */
  size?: AvatarSize;
  /** Negative margin to create overlap between avatars. Default: `'-0.5rem'`. */
  spacing?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Accessible label for the group. Default: `'Avatar group'`. */
  'aria-label'?: string;
  /** ID of the element that labels the group. */
  'aria-labelledby'?: string;
}

/**
 * Renders a group of `<Avatar>` elements with overlap and an overflow count indicator.
 */
export function AvatarGroup({
  max,
  size = 'md',
  spacing = '-0.5rem',
  children,
  className,
  style,
  'aria-label': ariaLabel = 'Avatar group',
  'aria-labelledby': ariaLabelledBy,
}: AvatarGroupProps): React.ReactElement {
  const childArray = React.Children.toArray(children);
  const visible = max !== undefined ? childArray.slice(0, max) : childArray;
  const overflow = max !== undefined ? childArray.length - max : 0;

  return (
    <span
      className={classNames(styles.group, className)}
      style={style}
      role="group"
      aria-label={ariaLabelledBy ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {visible.map((child, idx) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<AvatarProps>, {
          size,
          key: (child as React.ReactElement).key ?? idx,
          style: {
            ...(child as React.ReactElement<AvatarProps>).props.style,
            marginLeft: idx === 0 ? undefined : spacing,
          },
        });
      })}
      {overflow > 0 && (
        <span
          className={classNames(
            styles.avatar,
            styles[`size-${size}`],
            styles['shape-circle'],
            styles.overflow
          )}
          style={{ marginLeft: spacing }}
          aria-label={`${overflow} more`}
          role="img"
        >
          <span className={styles.initials} aria-hidden="true">
            +{overflow}
          </span>
        </span>
      )}
    </span>
  );
}
AvatarGroup.displayName = 'AvatarGroup';
