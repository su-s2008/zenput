'use client';
import React from 'react';

const style: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * Visually hides content while keeping it accessible to screen readers.
 *
 * The hiding styles are applied last so a consumer-supplied `style` prop
 * cannot accidentally make the content visible.
 */
export function VisuallyHidden({
  children,
  as: Tag = 'span',
  style: consumerStyle,
  ...rest
}: {
  children: React.ReactNode;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>): React.ReactElement {
  return (
    <Tag {...rest} style={{ ...consumerStyle, ...style }}>
      {children}
    </Tag>
  );
}
