import React from 'react';

export type CardVariant = 'outlined' | 'elevated' | 'filled';
export type CardPadding = 'sm' | 'md' | 'lg' | 'none';

export interface CardProps {
  /** Visual style variant. Defaults to 'outlined'. */
  variant?: CardVariant;
  /**
   * When true, adds hover/focus styles and an interactive role.
   * Use the `as` prop to render as `<button>` or `<a>`.
   */
  interactive?: boolean;
  /**
   * Padding applied to the card itself (useful when Card has no sub-section children).
   * Defaults to 'none' (sub-sections control their own padding).
   */
  padding?: CardPadding;
  /** Polymorphic: override the root element tag. Defaults to 'div'. */
  as?: React.ElementType;
  /** Additional CSS class. */
  className?: string;
  /** Additional inline style. */
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Forwarded to the root element (e.g. onClick for interactive cards). */
  onClick?: React.MouseEventHandler;
  /** href — used when as="a" */
  href?: string;
  /** tabIndex forwarded to root when interactive. */
  tabIndex?: number;
  /**
   * Button type. Only forwarded when the resolved root is a `<button>`. Defaults
   * to `'button'` to prevent accidental form submission when used inside a `<form>`.
   */
  type?: 'button' | 'submit' | 'reset';
}

export interface CardHeaderProps {
  /** Primary heading text. */
  title: string;
  /** Supporting subheading text. */
  description?: string;
  /** Action slot (e.g. a menu button). Rendered in the trailing position. */
  action?: React.ReactNode;
  /** Avatar/icon slot. Rendered in the leading position. */
  avatar?: React.ReactNode;
  /** Additional CSS class. */
  className?: string;
  style?: React.CSSProperties;
}

export interface CardMediaProps {
  /** Image source URL. */
  src: string;
  /** Alt text for the image. */
  alt?: string;
  /**
   * Aspect ratio (width / height) used to reserve space. Defaults to 16/9.
   * E.g. 1 = square, 4/3, 16/9.
   */
  aspectRatio?: number;
  /** Additional CSS class. */
  className?: string;
  style?: React.CSSProperties;
}

export interface CardBodyProps {
  /** Additional CSS class. */
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface CardFooterProps {
  /** Additional CSS class. */
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
