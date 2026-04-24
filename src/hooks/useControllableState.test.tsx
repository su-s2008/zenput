import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useControllableState } from './useControllableState';

// ---------------------------------------------------------------------------
// Harness component
// ---------------------------------------------------------------------------

interface HarnessProps<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (v: T) => void;
  componentName?: string;
}

function Harness<T extends string | number>({
  value,
  defaultValue,
  onChange,
  componentName,
}: HarnessProps<T>) {
  const [state, setState] = useControllableState<T>({
    value,
    defaultValue,
    onChange,
    componentName,
  });
  return (
    <div>
      <span data-testid="value">{String(state ?? '')}</span>
      <button onClick={() => setState('a' as T)}>set-a</button>
      <button onClick={() => setState('b' as T)}>set-b</button>
      <button onClick={() => setState((prev) => (prev === 'a' ? ('b' as T) : ('a' as T)))}>
        toggle
      </button>
      {/* rapid double-toggle */}
      <button
        onClick={() => {
          setState((prev) => (prev === 'a' ? ('b' as T) : ('a' as T)));
          setState((prev) => (prev === 'a' ? ('b' as T) : ('a' as T)));
        }}
      >
        double-toggle
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useControllableState', () => {
  describe('uncontrolled mode', () => {
    it('starts with defaultValue', () => {
      render(<Harness defaultValue="a" />);
      expect(screen.getByTestId('value')).toHaveTextContent('a');
    });

    it('starts with undefined when no defaultValue is provided', () => {
      render(<Harness />);
      expect(screen.getByTestId('value')).toHaveTextContent('');
    });

    it('updates state on set', () => {
      render(<Harness defaultValue="a" />);
      act(() => {
        screen.getByText('set-b').click();
      });
      expect(screen.getByTestId('value')).toHaveTextContent('b');
    });

    it('calls onChange on every change', () => {
      const onChange = vi.fn();
      render(<Harness defaultValue="a" onChange={onChange} />);
      act(() => {
        screen.getByText('set-b').click();
      });
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('b');
    });

    it('functional updater composes correctly under rapid calls', () => {
      const onChange = vi.fn();
      render(<Harness defaultValue="a" onChange={onChange} />);
      act(() => {
        screen.getByText('double-toggle').click();
      });
      // Two rapid toggles: a→b (pendingRef='b'), b→a (pendingRef='a').
      // Each call composes over pendingRef so they cancel out — back to 'a'.
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenNthCalledWith(1, 'b');
      expect(onChange).toHaveBeenNthCalledWith(2, 'a');
      expect(screen.getByTestId('value')).toHaveTextContent('a');
    });
  });

  describe('controlled mode', () => {
    it('reflects the controlled value', () => {
      render(<Harness value="a" />);
      expect(screen.getByTestId('value')).toHaveTextContent('a');
    });

    it('calls onChange when setter is invoked', () => {
      const onChange = vi.fn();
      render(<Harness value="a" onChange={onChange} />);
      act(() => {
        screen.getByText('set-b').click();
      });
      expect(onChange).toHaveBeenCalledWith('b');
    });

    it('does not call onChange when value would not change', () => {
      const onChange = vi.fn();
      render(<Harness value="a" onChange={onChange} />);
      act(() => {
        screen.getByText('set-a').click();
      });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('functional updater composes correctly under rapid successive calls (controlled)', () => {
      const onChange = vi.fn();
      const { rerender } = render(<Harness value="a" onChange={onChange} />);
      act(() => {
        screen.getByText('double-toggle').click();
      });
      // Two rapid toggles: a→b, b→a. Both should fire.
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenNthCalledWith(1, 'b');
      expect(onChange).toHaveBeenNthCalledWith(2, 'a');
      rerender(<Harness value="a" onChange={onChange} />);
    });
  });

  describe('dev warning for mode switch', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      vi.restoreAllMocks();
    });

    it('fires exactly once when switching from uncontrolled to controlled', () => {
      process.env.NODE_ENV = 'development';
      const { rerender } = render(<Harness componentName="TestComp" />);
      // Switch to controlled
      rerender(<Harness value="a" componentName="TestComp" />);
      rerender(<Harness value="b" componentName="TestComp" />);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('TestComp'));
    });

    it('does not warn in production', () => {
      process.env.NODE_ENV = 'production';
      const { rerender } = render(<Harness componentName="TestComp2" />);
      rerender(<Harness value="a" componentName="TestComp2" />);
      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});
