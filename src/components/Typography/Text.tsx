import React, { forwardRef } from 'react';
import { classNames } from '../../utils';
import type {
  PolymorphicProps,
  PolymorphicRef,
} from '../../types/polymorphic';
import styles from './Typography.module.css';

export type TextSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextTone =
  | 'neutral'
  | 'secondary'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'inverse'
  | 'disabled';
export type TextAlign = 'left' | 'center' | 'right';

export interface TextOwnProps {
  /** Font-size token. Default: `'md'`. */
  size?: TextSize;
  /** Font weight. Default: `'regular'`. */
  weight?: TextWeight;
  /** Semantic color tone. Default: `'neutral'`. */
  tone?: TextTone;
  /** Text alignment. */
  align?: TextAlign;
  /** If true, italicizes the text. */
  italic?: boolean;
  /** If true, underlines the text. */
  underline?: boolean;
  /** If true, truncates overflow to a single line with ellipsis. */
  truncate?: boolean;
  className?: string;
}

type TextComponent = <C extends React.ElementType = 'span'>(
  props: PolymorphicProps<C, TextOwnProps> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null;

/**
 * Polymorphic inline text primitive. Defaults to `<span>`; use `as` to
 * render as `<p>`, `<label>`, etc.
 */
export const Text = forwardRef(function Text(
  {
    as,
    size = 'md',
    weight = 'regular',
    tone = 'neutral',
    align,
    italic,
    underline,
    truncate,
    className,
    children,
    ...rest
  }: PolymorphicProps<React.ElementType, TextOwnProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component: React.ElementType = as ?? 'span';
  return (
    <Component
      ref={ref}
      className={classNames(
        styles.text,
        styles[`size-${size}`],
        styles[`weight-${weight}`],
        styles[`tone-${tone}`],
        align ? styles[`align-${align}`] : undefined,
        italic ? styles.italic : undefined,
        underline ? styles.underline : undefined,
        truncate ? styles.truncate : undefined,
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}) as unknown as TextComponent & { displayName?: string };

(Text as { displayName?: string }).displayName = 'Text';
