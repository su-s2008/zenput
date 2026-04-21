import React, { forwardRef } from 'react';
import { classNames } from '../../utils';
import styles from './Typography.module.css';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Open the link in a new tab (adds `rel="noopener noreferrer"`). */
  external?: boolean;
  className?: string;
}

/**
 * Styled anchor primitive. Use for navigation and inline links. For
 * button-like actions prefer `<Button>`.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { external, className, children, target, rel, ...rest },
  ref
) {
  const resolvedTarget = external ? '_blank' : target;
  const resolvedRel = resolvedTarget === '_blank'
    ? [rel, 'noopener', 'noreferrer'].filter(Boolean).join(' ')
    : rel;
  return (
    <a
      ref={ref}
      className={classNames(styles.link, className)}
      target={resolvedTarget}
      rel={resolvedRel}
      {...rest}
    >
      {children}
    </a>
  );
});