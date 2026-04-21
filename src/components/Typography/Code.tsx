import React, { forwardRef } from 'react';
import { classNames } from '../../utils';
import styles from './Typography.module.css';

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

/** Inline monospace code snippet. */
export const Code = forwardRef<HTMLElement, CodeProps>(function Code(
  { className, children, ...rest },
  ref
) {
  return (
    <code ref={ref} className={classNames(styles.code, className)} {...rest}>
      {children}
    </code>
  );
});
