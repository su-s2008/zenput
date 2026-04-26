import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { ToastProvider, useToast, getToastHandle } from './Toast';
import { expectNoA11yViolations } from '../../../test-utils/axe';

// Remove portal host between tests for isolation.
afterEach(() => {
  document.querySelectorAll('[data-zenput-portal]').forEach((el) => el.remove());
  // Always restore real timers so fake-timer tests can't pollute siblings.
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Trigger({ onClick, label = 'Show toast' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ToastProvider / useToast', () => {
  it('renders toasts when show() is called', async () => {
    function App() {
      const toast = useToast();
      return <Trigger onClick={() => toast.show({ title: 'Hello', status: 'info' })} />;
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );

    act(() => {
      screen.getByRole('button', { name: 'Show toast' }).click();
    });

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('renders all five statuses with correct roles', async () => {
    function App() {
      const toast = useToast();
      return (
        <div>
          <Trigger
            label="info"
            onClick={() => toast.show({ title: 'Info', status: 'info', duration: null })}
          />
          <Trigger
            label="success"
            onClick={() => toast.show({ title: 'Success', status: 'success', duration: null })}
          />
          <Trigger
            label="warning"
            onClick={() => toast.show({ title: 'Warning', status: 'warning', duration: null })}
          />
          <Trigger
            label="error"
            onClick={() => toast.show({ title: 'Error', status: 'error', duration: null })}
          />
          <Trigger
            label="loading"
            onClick={() => toast.show({ title: 'Loading', status: 'loading', duration: null })}
          />
        </div>
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );

    act(() => screen.getByRole('button', { name: 'info' }).click());
    act(() => screen.getByRole('button', { name: 'success' }).click());
    act(() => screen.getByRole('button', { name: 'warning' }).click());
    act(() => screen.getByRole('button', { name: 'error' }).click());
    act(() => screen.getByRole('button', { name: 'loading' }).click());

    await waitFor(() => {
      // error → role="alert", others → role="status"
      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toHaveTextContent('Error');

      const statuses = screen.getAllByRole('status');
      expect(statuses.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('renders description when provided', async () => {
    function App() {
      const toast = useToast();
      return (
        <Trigger
          onClick={() =>
            toast.show({
              title: 'Title here',
              description: 'Extra detail',
              status: 'success',
              duration: null,
            })
          }
        />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());

    await waitFor(() => {
      expect(screen.getByText('Extra detail')).toBeInTheDocument();
    });
  });

  it('renders an action button and calls onClick', async () => {
    const handleAction = vi.fn();
    function App() {
      const toast = useToast();
      return (
        <Trigger
          onClick={() =>
            toast.show({
              title: 'Saved',
              status: 'success',
              duration: null,
              action: { label: 'Undo', onClick: handleAction },
            })
          }
        />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());

    await waitFor(() => expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument());

    act(() => screen.getByRole('button', { name: 'Undo' }).click());
    expect(handleAction).toHaveBeenCalledOnce();
  });

  it('dismisses toast when close button is clicked', async () => {
    function App() {
      const toast = useToast();
      return (
        <Trigger
          onClick={() => toast.show({ title: 'Closeable', status: 'info', duration: null })}
        />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());

    await waitFor(() => expect(screen.getByText('Closeable')).toBeInTheDocument());

    act(() => {
      screen.getByRole('button', { name: 'Dismiss notification' }).click();
    });

    // Fallback removal effect cleans up exiting toasts even when CSS animations
    // don't run (jsdom / prefers-reduced-motion).
    await waitFor(() => {
      expect(screen.queryByText('Closeable')).not.toBeInTheDocument();
    });
  });

  it('calls onClose callback on dismiss', async () => {
    const onClose = vi.fn();
    function App() {
      const toast = useToast();
      return (
        <Trigger
          onClick={() => toast.show({ title: 'CB toast', status: 'info', duration: null, onClose })}
        />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());
    await waitFor(() => expect(screen.getByText('CB toast')).toBeInTheDocument());

    act(() => {
      screen.getByRole('button', { name: 'Dismiss notification' }).click();
    });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose exactly once even when close button is clicked multiple times', async () => {
    const onClose = vi.fn();
    function App() {
      const toast = useToast();
      return (
        <Trigger
          onClick={() =>
            toast.show({ title: 'Once toast', status: 'info', duration: null, onClose })
          }
        />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());
    await waitFor(() => expect(screen.getByText('Once toast')).toBeInTheDocument());

    act(() => {
      const closeBtn = screen.getByRole('button', { name: 'Dismiss notification' });
      closeBtn.click();
      closeBtn.click(); // second click should be a no-op
    });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('dismisses via Escape key when focused', async () => {
    function App() {
      const toast = useToast();
      return (
        <Trigger
          onClick={() => toast.show({ title: 'Escapable', status: 'info', duration: null })}
        />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());

    await waitFor(() => expect(screen.getByText('Escapable')).toBeInTheDocument());

    const toast = screen.getByRole('status');
    act(() => {
      fireEvent.keyDown(toast, { key: 'Escape' });
    });

    // Escape triggers dismiss → fallback removal effect removes the toast.
    await waitFor(() => {
      expect(screen.queryByRole('status')).toBeNull();
    });
  });

  it('auto-dismisses after duration', async () => {
    function App() {
      const toast = useToast();
      return (
        <Trigger onClick={() => toast.show({ title: 'Auto', status: 'info', duration: 50 })} />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => {
      screen.getByRole('button', { name: 'Show toast' }).click();
    });
    // Toast is visible immediately after the click
    expect(screen.getByText('Auto')).toBeInTheDocument();

    // Wait for the auto-dismiss timer + fallback exit removal to run.
    await waitFor(() => {
      expect(screen.queryByText('Auto')).not.toBeInTheDocument();
    });
  });

  it('does not auto-dismiss when duration is null', () => {
    vi.useFakeTimers();
    function App() {
      const toast = useToast();
      return (
        <Trigger
          onClick={() => toast.show({ title: 'Persistent', status: 'info', duration: null })}
        />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => {
      screen.getByRole('button', { name: 'Show toast' }).click();
    });
    expect(screen.getByText('Persistent')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    // Still present — no timer should have fired for a null-duration toast
    expect(screen.getByText('Persistent')).toBeInTheDocument();
  });

  it('respects max prop — trims oldest toasts', () => {
    function App() {
      const toast = useToast();
      return (
        <Trigger
          onClick={() => {
            toast.show({ title: 'A', status: 'info', duration: null });
            toast.show({ title: 'B', status: 'info', duration: null });
            toast.show({ title: 'C', status: 'info', duration: null });
          }}
        />
      );
    }
    render(
      <ToastProvider max={2}>
        <App />
      </ToastProvider>
    );
    act(() => {
      screen.getByRole('button', { name: 'Show toast' }).click();
    });

    // Only the last 2 toasts should be present
    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('dismiss() without id dismisses all toasts', async () => {
    function App() {
      const toast = useToast();
      return (
        <div>
          <Trigger
            label="add"
            onClick={() => {
              toast.show({ title: 'One', status: 'info', duration: null });
              toast.show({ title: 'Two', status: 'info', duration: null });
            }}
          />
          <Trigger label="clear" onClick={() => toast.dismiss()} />
        </div>
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => {
      screen.getByRole('button', { name: 'add' }).click();
    });
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();

    act(() => {
      screen.getByRole('button', { name: 'clear' }).click();
    });
    // Fallback removal effect cleans up all exiting toasts.
    await waitFor(() => {
      expect(screen.queryByText('One')).not.toBeInTheDocument();
      expect(screen.queryByText('Two')).not.toBeInTheDocument();
    });
  });

  it('getToastHandle() returns the singleton after provider mounts', () => {
    function App() {
      return <div />;
    }
    expect(getToastHandle()).toBeNull();
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    expect(getToastHandle()).not.toBeNull();
  });

  it('throws when useToast is used outside ToastProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function BadComponent() {
      useToast();
      return null;
    }
    expect(() => render(<BadComponent />)).toThrow(/ToastProvider/);
    consoleSpy.mockRestore();
  });

  it('useToast returns a stable reference across renders', () => {
    const handles: object[] = [];
    function App() {
      const toast = useToast();
      handles.push(toast);
      return <Trigger onClick={() => {}} />;
    }
    const { rerender } = render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    rerender(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    // The same handle object should be returned on every render
    expect(handles[0]).toBe(handles[1]);
  });

  it('has no axe violations when a toast is visible', async () => {
    function App() {
      const toast = useToast();
      return (
        <Trigger
          onClick={() =>
            toast.show({
              title: 'Accessible toast',
              description: 'No violations expected.',
              status: 'success',
              duration: null,
            })
          }
        />
      );
    }
    const { container } = render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => {
      screen.getByRole('button', { name: 'Show toast' }).click();
    });
    expect(screen.getByText('Accessible toast')).toBeInTheDocument();

    await expectNoA11yViolations(container);
  });

  // -------------------------------------------------------------------------
  // Centralized dismiss / onClose behavior
  // -------------------------------------------------------------------------

  it('fires onClose for programmatic dismiss(id)', async () => {
    const onClose = vi.fn();
    let toastId = '';
    function App() {
      const toast = useToast();
      return (
        <div>
          <Trigger
            label="show"
            onClick={() => {
              toastId = toast.show({
                title: 'Programmatic',
                status: 'info',
                duration: null,
                onClose,
              });
            }}
          />
          <Trigger label="dismiss" onClick={() => toast.dismiss(toastId)} />
        </div>
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'show' }).click());
    expect(screen.getByText('Programmatic')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    act(() => screen.getByRole('button', { name: 'dismiss' }).click());
    expect(onClose).toHaveBeenCalledOnce();

    await waitFor(() => {
      expect(screen.queryByText('Programmatic')).not.toBeInTheDocument();
    });
  });

  it('fires onClose for every active toast on dismiss() (all)', () => {
    const onCloseA = vi.fn();
    const onCloseB = vi.fn();
    function App() {
      const toast = useToast();
      return (
        <div>
          <Trigger
            label="add"
            onClick={() => {
              toast.show({ title: 'A', status: 'info', duration: null, onClose: onCloseA });
              toast.show({ title: 'B', status: 'info', duration: null, onClose: onCloseB });
            }}
          />
          <Trigger label="clear" onClick={() => toast.dismiss()} />
        </div>
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'add' }).click());
    act(() => screen.getByRole('button', { name: 'clear' }).click());
    expect(onCloseA).toHaveBeenCalledOnce();
    expect(onCloseB).toHaveBeenCalledOnce();
  });

  it('does not double-fire onClose when dismiss is called twice', () => {
    const onClose = vi.fn();
    let toastId = '';
    function App() {
      const toast = useToast();
      return (
        <div>
          <Trigger
            label="show"
            onClick={() => {
              toastId = toast.show({
                title: 'OnceOnly',
                status: 'info',
                duration: null,
                onClose,
              });
            }}
          />
          <Trigger label="dismiss" onClick={() => toast.dismiss(toastId)} />
        </div>
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'show' }).click());
    act(() => {
      screen.getByRole('button', { name: 'dismiss' }).click();
      screen.getByRole('button', { name: 'dismiss' }).click();
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('fires onClose for evicted toasts when max is exceeded', () => {
    const onCloseA = vi.fn();
    const onCloseB = vi.fn();
    const onCloseC = vi.fn();
    function App() {
      const toast = useToast();
      return (
        <Trigger
          onClick={() => {
            toast.show({ title: 'A', status: 'info', duration: null, onClose: onCloseA });
            toast.show({ title: 'B', status: 'info', duration: null, onClose: onCloseB });
            toast.show({ title: 'C', status: 'info', duration: null, onClose: onCloseC });
          }}
        />
      );
    }
    render(
      <ToastProvider max={2}>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());

    // A is evicted by max=2; B and C survive.
    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();

    expect(onCloseA).toHaveBeenCalledOnce();
    expect(onCloseB).not.toHaveBeenCalled();
    expect(onCloseC).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Reduced-motion / fallback removal
  // -------------------------------------------------------------------------

  it('removes exiting toast even when CSS animations are disabled', async () => {
    // jsdom does not run CSS animations, so this test exercises the JS
    // fallback timer that handles `prefers-reduced-motion: reduce`.
    function App() {
      const toast = useToast();
      return (
        <Trigger onClick={() => toast.show({ title: 'Stuck?', status: 'info', duration: null })} />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());
    expect(screen.getByText('Stuck?')).toBeInTheDocument();

    act(() => {
      screen.getByRole('button', { name: 'Dismiss notification' }).click();
    });

    await waitFor(() => {
      expect(screen.queryByText('Stuck?')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Singleton multi-provider safety
  // -------------------------------------------------------------------------

  it('keeps singleton handle alive when a non-owning provider unmounts', () => {
    function Inner() {
      return <div />;
    }
    // The most recently-mounted provider owns the singleton (last wins).
    // Unmounting any other provider must NOT null the singleton.
    function Setup({ showFirst }: { showFirst: boolean }) {
      return (
        <div>
          {showFirst && (
            <ToastProvider key="first">
              <Inner />
            </ToastProvider>
          )}
          <ToastProvider key="second">
            <Inner />
          </ToastProvider>
        </div>
      );
    }
    const { rerender, unmount } = render(<Setup showFirst={true} />);
    expect(getToastHandle()).not.toBeNull();
    const handleBefore = getToastHandle();

    // Unmount the first (non-owning) provider.
    rerender(<Setup showFirst={false} />);

    // The singleton must still be the second provider's handle.
    expect(getToastHandle()).not.toBeNull();
    expect(getToastHandle()).toBe(handleBefore);

    // Unmounting the last remaining provider does clear the singleton.
    unmount();
    expect(getToastHandle()).toBeNull();
  });

  // -------------------------------------------------------------------------
  // promise() unmount safety
  // -------------------------------------------------------------------------

  it('does not throw when provider unmounts while promise() resolution is pending', async () => {
    let resolvePromise: (value: string) => void = () => {};
    const p = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });
    function App() {
      const toast = useToast();
      return (
        <Trigger
          onClick={() => {
            void toast.promise(p, { loading: 'L', success: 'S', error: 'E' });
          }}
        />
      );
    }
    const { unmount } = render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());
    expect(screen.getByText('L')).toBeInTheDocument();

    // Resolve the promise. The provider's `setTimeout` to show the success
    // toast is now scheduled.
    await act(async () => {
      resolvePromise('ok');
      await Promise.resolve();
    });

    // Unmount before the success toast can be scheduled into state.
    unmount();

    // Wait long enough for the PROMISE_TRANSITION_DELAY_MS timeout. If the
    // provider didn't clean up its pending timeouts, this would warn about
    // setting state on an unmounted component.
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await new Promise((r) => setTimeout(r, 200));
    expect(consoleErr).not.toHaveBeenCalled();
    consoleErr.mockRestore();
  });

  // -------------------------------------------------------------------------
  // promise() success / error paths
  // -------------------------------------------------------------------------

  it('promise() shows loading then success toast when resolved', async () => {
    let resolvePromise: (value: string) => void = () => {};
    const p = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });
    function App() {
      const toast = useToast();
      return (
        <Trigger
          onClick={() => {
            void toast.promise(p, {
              loading: 'Saving',
              success: (data) => `Saved ${data}`,
              error: 'Failed',
            });
          }}
        />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());
    expect(screen.getByText('Saving')).toBeInTheDocument();

    await act(async () => {
      resolvePromise('ok');
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(screen.getByText('Saved ok')).toBeInTheDocument();
    });
  });

  it('promise() shows loading then error toast when rejected', async () => {
    let rejectPromise: (err: unknown) => void = () => {};
    const p = new Promise<string>((_, reject) => {
      rejectPromise = reject;
    });
    function App() {
      const toast = useToast();
      const handle = () => {
        toast
          .promise(p, {
            loading: 'Saving',
            success: 'Saved',
            error: (e) => `Error: ${(e as Error).message}`,
          })
          .catch(() => {
            // expected
          });
      };
      return <Trigger onClick={handle} />;
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());
    expect(screen.getByText('Saving')).toBeInTheDocument();

    await act(async () => {
      rejectPromise(new Error('boom'));
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(screen.getByText('Error: boom')).toBeInTheDocument();
    });
  });

  it('promise() supports static success/error message strings', async () => {
    let resolvePromise: (value: number) => void = () => {};
    const p = new Promise<number>((resolve) => {
      resolvePromise = resolve;
    });
    function App() {
      const toast = useToast();
      return (
        <Trigger
          onClick={() => {
            void toast.promise(p, { loading: 'L', success: 'S', error: 'E' });
          }}
        />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());
    await act(async () => {
      resolvePromise(1);
      await Promise.resolve();
    });
    await waitFor(() => expect(screen.getByText('S')).toBeInTheDocument());
  });

  // -------------------------------------------------------------------------
  // Hover / focus pause-and-resume the auto-dismiss timer
  // -------------------------------------------------------------------------

  it('pauses auto-dismiss timer on mouseenter and resumes on mouseleave', async () => {
    function App() {
      const toast = useToast();
      return <Trigger onClick={() => toast.show({ title: 'Hov', status: 'info', duration: 80 })} />;
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());
    const toastEl = screen.getByRole('status');

    // Pause via mouseenter immediately, well before duration elapses.
    act(() => {
      fireEvent.mouseEnter(toastEl);
    });
    // Wait longer than the duration; the toast should still be present.
    await new Promise((r) => setTimeout(r, 150));
    expect(screen.getByText('Hov')).toBeInTheDocument();

    // Resume via mouseleave; toast should now auto-dismiss.
    act(() => {
      fireEvent.mouseLeave(toastEl);
    });
    await waitFor(() => {
      expect(screen.queryByText('Hov')).not.toBeInTheDocument();
    });
  });

  it('pauses auto-dismiss timer on focus and resumes on blur', async () => {
    function App() {
      const toast = useToast();
      return <Trigger onClick={() => toast.show({ title: 'Foc', status: 'info', duration: 80 })} />;
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());
    const toastEl = screen.getByRole('status');

    act(() => fireEvent.focus(toastEl));
    await new Promise((r) => setTimeout(r, 150));
    expect(screen.getByText('Foc')).toBeInTheDocument();

    act(() => fireEvent.blur(toastEl));
    await waitFor(() => {
      expect(screen.queryByText('Foc')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Touch swipe-to-dismiss
  // -------------------------------------------------------------------------

  it('dismisses on a horizontal swipe past the threshold', async () => {
    function App() {
      const toast = useToast();
      return (
        <Trigger onClick={() => toast.show({ title: 'Swipe', status: 'info', duration: null })} />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());
    const toastEl = screen.getByRole('status');

    // Real touch gestures have async gaps between events; split each event into
    // its own `act()` so the swipe state set by `touchMove` commits before
    // `touchEnd` reads it.
    act(() => {
      fireEvent.touchStart(toastEl, { touches: [{ clientX: 0, clientY: 0 }] });
    });
    act(() => {
      fireEvent.touchMove(toastEl, { touches: [{ clientX: 120, clientY: 0 }] });
    });
    act(() => {
      fireEvent.touchEnd(toastEl);
    });

    await waitFor(() => {
      expect(screen.queryByText('Swipe')).not.toBeInTheDocument();
    });
  });

  it('does not dismiss when the swipe is below the threshold and resumes the timer', async () => {
    function App() {
      const toast = useToast();
      return (
        <Trigger onClick={() => toast.show({ title: 'Tiny', status: 'info', duration: 100 })} />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());
    const toastEl = screen.getByRole('status');

    act(() => {
      fireEvent.touchStart(toastEl, { touches: [{ clientX: 0, clientY: 0 }] });
    });
    act(() => {
      fireEvent.touchMove(toastEl, { touches: [{ clientX: 10, clientY: 0 }] });
    });
    act(() => {
      fireEvent.touchEnd(toastEl);
    });

    // Toast should still be present right after the small swipe, then disappear
    // once the resumed timer fires.
    expect(screen.getByText('Tiny')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Tiny')).not.toBeInTheDocument();
    });
  });

  it('ignores predominantly-vertical touch movement', () => {
    function App() {
      const toast = useToast();
      return (
        <Trigger onClick={() => toast.show({ title: 'Vert', status: 'info', duration: null })} />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());
    const toastEl = screen.getByRole('status');

    act(() => {
      fireEvent.touchStart(toastEl, { touches: [{ clientX: 0, clientY: 0 }] });
    });
    act(() => {
      fireEvent.touchMove(toastEl, { touches: [{ clientX: 5, clientY: 200 }] });
    });
    act(() => {
      fireEvent.touchEnd(toastEl);
    });

    // Vertical-dominant move never engages swipe state, so the toast stays.
    expect(screen.getByText('Vert')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Animation-end removal path
  // -------------------------------------------------------------------------

  it('removes toast on toast-exit animationend', async () => {
    function App() {
      const toast = useToast();
      return (
        <Trigger onClick={() => toast.show({ title: 'Anim', status: 'info', duration: null })} />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());
    const toastEl = screen.getByRole('status');

    act(() => {
      screen.getByRole('button', { name: 'Dismiss notification' }).click();
    });

    // Fire the matching animationend before the fallback timer runs.
    act(() => {
      fireEvent.animationEnd(toastEl, { animationName: 'toast-exit' });
    });

    await waitFor(() => {
      expect(screen.queryByText('Anim')).not.toBeInTheDocument();
    });
  });

  it('ignores animationend events whose name is not toast-exit', () => {
    function App() {
      const toast = useToast();
      return (
        <Trigger onClick={() => toast.show({ title: 'Other', status: 'info', duration: null })} />
      );
    }
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );
    act(() => screen.getByRole('button', { name: 'Show toast' }).click());
    const toastEl = screen.getByRole('status');

    act(() => {
      fireEvent.animationEnd(toastEl, { animationName: 'toast-enter' });
    });
    // Should still be visible because non-exit animationend is ignored.
    expect(screen.getByText('Other')).toBeInTheDocument();
  });
});
