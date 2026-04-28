'use client';
import React, { forwardRef } from 'react';
import { classNames } from '../../utils';
import { Slot } from '../../utils/slot';
import type { PolymorphicProps, PolymorphicRef } from '../../types/polymorphic';
import { createPolymorphicComponent } from '../../types/polymorphic';
import styles from './Typography.module.css';

export interface LinkOwnProps {
  /** Open the link in a new tab (adds `rel="noopener noreferrer"`). */
  external?: boolean;
  className?: string;
}

type LinkComponent = <C extends React.ElementType = 'a'>(
  props: PolymorphicProps<C, LinkOwnProps> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null;

/**
 * Styled anchor primitive. Use for navigation and inline links. For
 * button-like actions prefer `<Button>`. Polymorphic via `as`/`asChild`.
 */
export const Link = createPolymorphicComponent<LinkComponent>(
  forwardRef(function Link(
  {
    as,
    asChild,
    external,
    className,
    children,
    target,
    rel,
    ...rest
  }: PolymorphicProps<React.ElementType, LinkOwnProps> & {
    target?: string;
    rel?: string;
  },
  ref: React.ForwardedRef<Element>
) {
  const Component: React.ElementType = asChild ? Slot : (as ?? 'a');
  // Forward target/rel (and the `external` convenience) only when the element is
  // an anchor or an unknown custom component. For known non-anchor DOM elements
  // (e.g. as="span", as="button") omit them to avoid invalid DOM attribute warnings.
  const isAnchorLike = asChild || typeof (as ?? 'a') !== 'string' || (as ?? 'a') === 'a';
  const resolvedTarget = external ? '_blank' : target;
  const resolvedRel =
    resolvedTarget === '_blank' ? [rel, 'noopener', 'noreferrer'].filter(Boolean).join(' ') : rel;
  return (
    <Component
      ref={ref}
      className={classNames(styles.link, className)}
      {...(isAnchorLike ? { target: resolvedTarget, rel: resolvedRel } : {})}
      {...rest}
    >
      {children}
    </Component>
  );
}),
'Link'
);

/** @deprecated Use `LinkOwnProps` or the component's inferred props instead. */
export type LinkProps = PolymorphicProps<'a', LinkOwnProps>;
