import React, { useRef } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

// ---------------------------------------------------------------------------
// Harness component
// ---------------------------------------------------------------------------

interface HarnessProps {
  active: boolean;
  initialFocusId?: string;
  returnFocusId?: string;
  clickOutsideDeactivates?: boolean;
  children?: React.ReactNode;
}

function Harness({
  active,
  initialFocusId,
  returnFocusId,
  clickOutsideDeactivates,
  children,
}: HarnessProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLButtonElement>(null);

  useFocusTrap({
    active,
    containerRef,
    initialFocusRef: initialFocusId ? initialFocusRef : undefined,
    returnFocusRef: returnFocusId ? returnFocusRef : undefined,
    clickOutsideDeactivates,
  });

  return (
    <div>
      {returnFocusId && (
        <button ref={returnFocusRef} data-testid={returnFocusId}>
          return-target
        </button>
      )}
      <div ref={containerRef} data-testid="trap-container">
        {children ?? (
          <>
            {initialFocusId && (
              <button ref={initialFocusRef} data-testid={initialFocusId}>
                initial
              </button>
            )}
            <button data-testid="btn-1">Button 1</button>
            <button data-testid="btn-2">Button 2</button>
            <button data-testid="btn-3">Button 3</button>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

/** Helper that creates a real bubbling KeyboardEvent (fireEvent loses preventDefault spy). */
function createTabEvent(shiftKey: boolean): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useFocusTrap', () => {
  it('traps Tab: wraps from last to first', () => {
    render(<Harness active />);

    // Focus the last button
    screen.getByTestId('btn-3').focus();
    expect(document.activeElement).toBe(screen.getByTestId('btn-3'));

    // Tab from last should wrap to first
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(screen.getByTestId('btn-1'));
  });

  it('traps Shift+Tab: wraps from first to last', () => {
    render(<Harness active />);

    screen.getByTestId('btn-1').focus();
    expect(document.activeElement).toBe(screen.getByTestId('btn-1'));

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByTestId('btn-3'));
  });

  it('focuses initialFocusRef on activation', () => {
    render(<Harness active initialFocusId="init-btn" />);
    expect(document.activeElement).toBe(screen.getByTestId('init-btn'));
  });

  it('focuses the first tabbable element when no initialFocusRef', () => {
    render(<Harness active />);
    // btn-1 is the first tabbable
    expect(document.activeElement).toBe(screen.getByTestId('btn-1'));
  });

  it('restores focus to returnFocusRef on deactivation', () => {
    const { rerender } = render(<Harness active returnFocusId="return-btn" />);
    // Trap is active, focus should be on first tabbable inside container
    expect(document.activeElement).toBe(screen.getByTestId('btn-1'));

    act(() => {
      rerender(<Harness active={false} returnFocusId="return-btn" />);
    });

    expect(document.activeElement).toBe(screen.getByTestId('return-btn'));
  });

  it('restores focus to the previously focused element when no returnFocusRef', () => {
    // Focus something before the trap activates
    const { rerender } = render(
      <div>
        <button data-testid="outside">Outside</button>
        <Harness active={false} />
      </div>
    );

    screen.getByTestId('outside').focus();

    act(() => {
      rerender(
        <div>
          <button data-testid="outside">Outside</button>
          <Harness active />
        </div>
      );
    });

    act(() => {
      rerender(
        <div>
          <button data-testid="outside">Outside</button>
          <Harness active={false} />
        </div>
      );
    });

    expect(document.activeElement).toBe(screen.getByTestId('outside'));
  });

  it('handles a container with zero tabbable elements by focusing the container', () => {
    render(
      <Harness active>
        {/* No interactive children */}
        <span>No focusable elements here</span>
      </Harness>
    );
    const container = screen.getByTestId('trap-container');
    expect(document.activeElement).toBe(container);
    expect(container.getAttribute('tabindex')).toBe('-1');
  });

  it('removes tabindex added to the container when trap deactivates', () => {
    const { rerender } = render(
      <Harness active>
        <span>No focusable elements here</span>
      </Harness>
    );
    const container = screen.getByTestId('trap-container');
    expect(container.getAttribute('tabindex')).toBe('-1');

    act(() => {
      rerender(
        <Harness active={false}>
          <span>No focusable elements here</span>
        </Harness>
      );
    });

    expect(container.getAttribute('tabindex')).toBeNull();
  });

  it('does not remove a pre-existing tabindex when trap deactivates', () => {
    // Render inactive first so no tabindex is added by the hook.
    function Container({ active }: { active: boolean }) {
      const containerRef = React.useRef<HTMLDivElement>(null);
      useFocusTrap({ active, containerRef });
      return (
        <div ref={containerRef} data-testid="pre-tab-container">
          <button data-testid="inner-btn">Button</button>
        </div>
      );
    }

    const { rerender } = render(<Container active={false} />);
    const container = screen.getByTestId('pre-tab-container');

    // Simulate a pre-existing tabindex added by consumer code (not the hook).
    container.setAttribute('tabindex', '0');
    expect(container.getAttribute('tabindex')).toBe('0');

    // Activate the trap — hook sees a pre-existing tabindex so it doesn't add one.
    act(() => {
      rerender(<Container active />);
    });
    expect(container.getAttribute('tabindex')).toBe('0');

    // Deactivate — hook must NOT remove the attribute it did not add.
    act(() => {
      rerender(<Container active={false} />);
    });
    expect(container.getAttribute('tabindex')).toBe('0');
  });

  it('prevents Tab from escaping when there is only one tabbable element', () => {
    render(
      <Harness active>
        <button data-testid="only-btn">Only button</button>
      </Harness>
    );
    const btn = screen.getByTestId('only-btn');
    btn.focus();

    const event = createTabEvent(false);
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    document.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    // Focus remains on the single tabbable element
    expect(document.activeElement).toBe(btn);
  });

  it('cleans up event listeners on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = render(<Harness active />);

    act(() => {
      unmount();
    });

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('focusin', expect.any(Function));
  });

  it('does not trap focus when active=false', () => {
    render(<Harness active={false} />);

    screen.getByTestId('btn-3').focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    // No wrapping should happen since trap is inactive
    expect(document.activeElement).toBe(screen.getByTestId('btn-3'));
  });

  it('does not call preventDefault on non-Tab keys', () => {
    render(<Harness active />);

    screen.getByTestId('btn-1').focus();
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    document.dispatchEvent(event);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('prevents Tab from escaping when container has no tabbable elements (zero case)', () => {
    render(
      <Harness active>
        {/* No interactive children */}
        <span>No focusable elements here</span>
      </Harness>
    );
    const container = screen.getByTestId('trap-container');
    container.focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    document.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(container);
  });

  it('pulls focus back into container when clickOutsideDeactivates=false and focus escapes', () => {
    render(
      <div>
        <button data-testid="outside-btn">Outside</button>
        <Harness active clickOutsideDeactivates={false} />
      </div>
    );

    // Move focus outside the trap container – the focusin handler should pull it back
    screen.getByTestId('outside-btn').focus();

    // With clickOutsideDeactivates=false, the handleFocusIn callback fires and
    // restores focus to the first tabbable element inside the container.
    expect(document.activeElement).toBe(screen.getByTestId('btn-1'));
  });
});
