import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEscapeKey } from './useEscapeKey';

function Harness({ active, onEscape }: { active: boolean; onEscape: () => void }) {
  useEscapeKey(active, onEscape);
  return <div />;
}

describe('useEscapeKey', () => {
  it('calls onEscape when Escape is pressed while active', () => {
    const onEscape = vi.fn();
    render(<Harness active onEscape={onEscape} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('does not call onEscape for non-Escape keys while active', () => {
    const onEscape = vi.fn();
    render(<Harness active onEscape={onEscape} />);
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('does not call onEscape when inactive', () => {
    const onEscape = vi.fn();
    render(<Harness active={false} onEscape={onEscape} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('removes listener when active becomes false', () => {
    const onEscape = vi.fn();
    const { rerender } = render(<Harness active onEscape={onEscape} />);
    act(() => {
      rerender(<Harness active={false} onEscape={onEscape} />);
    });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).not.toHaveBeenCalled();
  });
});
