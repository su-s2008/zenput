import React, { forwardRef } from 'react';
import { classNames } from '../../../utils';
import { normalizeSpacingKey } from '../../../tokens';
import type {
  PolymorphicProps,
  PolymorphicRef,
} from '../../../types/polymorphic';
import styles from './Box.module.css';

export type SpacingValue =
  | '0'
  | '0.5'
  | '1'
  | '1.5'
  | '2'
  | '2.5'
  | '3'
  | '4'
  | '5'
  | '6'
  | '8'
  | '10'
  | '12'
  | '16'
  | '20'
  | '24';

export type RadiusValue = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ShadowValue = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BoxOwnProps {
  /** Padding shorthand (all sides). */
  p?: SpacingValue;
  /** Horizontal padding. */
  px?: SpacingValue;
  /** Vertical padding. */
  py?: SpacingValue;
  /** Top padding. */
  pt?: SpacingValue;
  /** Right padding. */
  pr?: SpacingValue;
  /** Bottom padding. */
  pb?: SpacingValue;
  /** Left padding. */
  pl?: SpacingValue;
  /** Margin shorthand (all sides). */
  m?: SpacingValue;
  /** Horizontal margin. */
  mx?: SpacingValue;
  /** Vertical margin. */
  my?: SpacingValue;
  /** Top margin. */
  mt?: SpacingValue;
  /** Right margin. */
  mr?: SpacingValue;
  /** Bottom margin. */
  mb?: SpacingValue;
  /** Left margin. */
  ml?: SpacingValue;
  /** Background token name (e.g. 'surface', 'brand-subtle'). */
  bg?: string;
  /** Text color token name. */
  color?: string;
  /** Border radius token. */
  radius?: RadiusValue;
  /** Shadow/elevation token. */
  shadow?: ShadowValue;
  /** If true, sets width: 100%. */
  fullWidth?: boolean;
  /** Additional style merge. */
  style?: React.CSSProperties;
  className?: string;
}

type BoxComponent = <C extends React.ElementType = 'div'>(
  props: PolymorphicProps<C, BoxOwnProps> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null;

function spacingToken(v: SpacingValue | undefined): string | undefined {
  return v === undefined ? undefined : `var(--zp-space-${normalizeSpacingKey(v)})`;
}

function radiusToken(v: RadiusValue | undefined): string | undefined {
  return v === undefined ? undefined : `var(--zp-radius-${v})`;
}

function shadowToken(v: ShadowValue | undefined): string | undefined {
  return v === undefined ? undefined : `var(--zp-shadow-${v})`;
}

function colorToken(v: string | undefined): string | undefined {
  return v === undefined ? undefined : `var(--zp-color-${v})`;
}

/**
 * Low-level styled container. Accepts spacing/color/radius/shadow
 * props that map to design tokens. Polymorphic via `as`.
 */
export const Box = forwardRef(function Box(
  {
    as,
    p,
    px,
    py,
    pt,
    pr,
    pb,
    pl,
    m,
    mx,
    my,
    mt,
    mr,
    mb,
    ml,
    bg,
    color,
    radius,
    shadow,
    fullWidth,
    style,
    className,
    children,
    ...rest
  }: PolymorphicProps<React.ElementType, BoxOwnProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component: React.ElementType = as ?? 'div';
  const resolvedStyle: React.CSSProperties = {
    padding: spacingToken(p),
    paddingLeft: spacingToken(pl) ?? spacingToken(px),
    paddingRight: spacingToken(pr) ?? spacingToken(px),
    paddingTop: spacingToken(pt) ?? spacingToken(py),
    paddingBottom: spacingToken(pb) ?? spacingToken(py),
    margin: spacingToken(m),
    marginLeft: spacingToken(ml) ?? spacingToken(mx),
    marginRight: spacingToken(mr) ?? spacingToken(mx),
    marginTop: spacingToken(mt) ?? spacingToken(my),
    marginBottom: spacingToken(mb) ?? spacingToken(my),
    backgroundColor: colorToken(bg),
    color: colorToken(color),
    borderRadius: radiusToken(radius),
    boxShadow: shadowToken(shadow),
    ...style,
  };
  return (
    <Component
      ref={ref}
      className={classNames(
        styles.box,
        fullWidth ? styles.fullWidth : undefined,
        className
      )}
      style={resolvedStyle}
      {...rest}
    >
      {children}
    </Component>
  );
}) as unknown as BoxComponent & { displayName?: string };

(Box as { displayName?: string }).displayName = 'Box';