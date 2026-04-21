import React, { forwardRef } from 'react';
import { classNames } from '../../utils';
import type {
  PolymorphicProps,
  PolymorphicRef,
} from '../../types/polymorphic';
import styles from './Typography.module.css';
import type { TextTone } from './Text';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize =
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl';
export type HeadingWeight = 'medium' | 'semibold' | 'bold';

const defaultSizeByLevel: Record<HeadingLevel, HeadingSize> = {
  1: '4xl',
  2: '3xl',
  3: '2xl',
  4: 'xl',
  5: 'lg',
  6: 'md',
};

export interface HeadingOwnProps {
  /** Heading level (1-6). Used for both the HTML element and the default size. Default: `2`. */
  level?: HeadingLevel;
  /** Override size independently of level. */
  size?: HeadingSize;
  /** Font weight. Default: `'semibold'`. */
  weight?: HeadingWeight;
  /** Semantic color tone. Default: `'neutral'`. */
  tone?: TextTone;
  className?: string;
}

type HeadingComponent = <C extends React.ElementType = 'h2'>(
  props: PolymorphicProps<C, HeadingOwnProps> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null;

/**
 * Semantic heading primitive. Renders `<h{level}>` unless overridden via
 * `as`; size defaults scale with the level but can be overridden.
 */
export const Heading = forwardRef(function Heading(
  {
    as,
    level = 2,
    size,
    weight = 'semibold',
    tone = 'neutral',
    className,
    children,
    ...rest
  }: PolymorphicProps<React.ElementType, HeadingOwnProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component: React.ElementType = as ?? `h${level}`;
  const resolvedSize = size ?? defaultSizeByLevel[level];
  return (
    <Component
      ref={ref}
      className={classNames(
        styles.text,
        styles[`size-${resolvedSize}`],
        styles[`weight-${weight}`],
        styles[`tone-${tone}`],
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}) as unknown as HeadingComponent & { displayName?: string };

(Heading as { displayName?: string }).displayName = 'Heading';
