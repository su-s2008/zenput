import React, { forwardRef } from 'react';
import { classNames } from '../../utils';
import styles from './Typography.module.css';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

/** Keyboard-key inline primitive (renders a `<kbd>`). */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { className, children, ...rest },
  ref
) {
  return (
    <kbd ref={ref} className={classNames(styles.kbd, className)} {...rest}>
      {children}
    </kbd>
  );
});
