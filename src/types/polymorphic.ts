import React from 'react';

/** Shared size vocabulary across the library. */
export type Size = 'sm' | 'md' | 'lg';

/** Shared semantic tone used by alerts, badges, buttons, etc. */
export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Polymorphic-component helpers.
 *
 * Components using these can accept an `as` prop and forward-ref to the
 * underlying rendered element while still exposing the correct props
 * for that element type.
 */
export type AsProp<C extends React.ElementType> = {
  /** Element type to render. */
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

export type PolymorphicProps<
  C extends React.ElementType,
  Props = object,
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

export type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref'];

export type PolymorphicPropsWithRef<
  C extends React.ElementType,
  Props = object,
> = PolymorphicProps<C, Props> & { ref?: PolymorphicRef<C> };
