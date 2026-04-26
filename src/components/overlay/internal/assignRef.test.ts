import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { assignRef } from './assignRef';

describe('assignRef', () => {
  it('calls a callback ref with the node', () => {
    const callbackRef = vi.fn();
    const node = document.createElement('div');
    assignRef(callbackRef, node);
    expect(callbackRef).toHaveBeenCalledWith(node);
  });

  it('calls a callback ref with null', () => {
    const callbackRef = vi.fn();
    assignRef(callbackRef, null);
    expect(callbackRef).toHaveBeenCalledWith(null);
  });

  it('assigns node to a RefObject.current', () => {
    const ref = React.createRef<HTMLDivElement>();
    const node = document.createElement('div');
    assignRef(ref as React.RefObject<HTMLDivElement | null>, node);
    expect(ref.current).toBe(node);
  });

  it('assigns null to a RefObject.current', () => {
    const ref = {
      current: document.createElement('div'),
    } as React.MutableRefObject<HTMLDivElement | null>;
    assignRef(ref, null);
    expect(ref.current).toBeNull();
  });

  it('does nothing when forwardedRef is undefined', () => {
    expect(() => assignRef(undefined, document.createElement('div'))).not.toThrow();
  });
});
