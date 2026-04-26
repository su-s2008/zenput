import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { PopoverProvider, usePopover } from './PopoverProvider';

afterEach(() => {
  document.querySelectorAll('[data-zenput-portal]').forEach((el) => el.remove());
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function PopoverButton({
  onResult,
  dismissible,
}: {
  onResult: (v: unknown) => void;
  dismissible?: boolean;
}) {
  const popover = usePopover();
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={buttonRef}
      onClick={() => {
        const handle = popover.open({
          anchor: buttonRef as React.RefObject<HTMLElement>,
          dismissible,
          content: ({ close }) => (
            <div>
              <span>Popover content</span>
              <button onClick={() => close('value')}>Close</button>
            </div>
          ),
        });
        handle.result.then(onResult);
      }}
    >
      Open Popover
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('usePopover', () => {
  it('renders a popover when invoked', async () => {
    render(
      <PopoverProvider>
        <PopoverButton onResult={() => undefined} />
      </PopoverProvider>
    );

    await act(async () => {
      screen.getByText('Open Popover').click();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('resolves with the close value', async () => {
    const results: unknown[] = [];
    render(
      <PopoverProvider>
        <PopoverButton onResult={(v) => results.push(v)} />
      </PopoverProvider>
    );

    await act(async () => {
      screen.getByText('Open Popover').click();
    });
    await act(async () => {
      screen.getByText('Close').click();
    });

    await waitFor(() => expect(results).toEqual(['value']));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape when dismissible (default)', async () => {
    render(
      <PopoverProvider>
        <PopoverButton onResult={() => undefined} />
      </PopoverProvider>
    );

    await act(async () => {
      screen.getByText('Open Popover').click();
    });
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not close on Escape when dismissible=false', async () => {
    render(
      <PopoverProvider>
        <PopoverButton dismissible={false} onResult={() => undefined} />
      </PopoverProvider>
    );

    await act(async () => {
      screen.getByText('Open Popover').click();
    });
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('accepts { x, y } as anchor', async () => {
    function CoordPopover() {
      const popover = usePopover();
      return (
        <button
          onClick={() => {
            popover.open({
              anchor: { x: 100, y: 100 },
              content: () => <span>At coordinates</span>,
            });
          }}
        >
          Open At Coords
        </button>
      );
    }

    render(
      <PopoverProvider>
        <CoordPopover />
      </PopoverProvider>
    );

    await act(async () => {
      screen.getByText('Open At Coords').click();
    });

    expect(screen.getByText('At coordinates')).toBeInTheDocument();
  });

  it('accepts an HTMLElement directly as anchor', async () => {
    function ElementAnchorPopover() {
      const popover = usePopover();
      return (
        <button
          data-testid="anchor-btn"
          onClick={(e) => {
            popover.open({
              anchor: e.currentTarget as HTMLElement,
              content: () => <span>From element anchor</span>,
            });
          }}
        >
          Open
        </button>
      );
    }

    render(
      <PopoverProvider>
        <ElementAnchorPopover />
      </PopoverProvider>
    );

    await act(async () => {
      screen.getByTestId('anchor-btn').click();
    });

    expect(screen.getByText('From element anchor')).toBeInTheDocument();
  });

  it('closes on outside click when dismissible (default)', async () => {
    render(
      <div>
        <div data-testid="outside">outside</div>
        <PopoverProvider>
          <PopoverButton onResult={() => undefined} />
        </PopoverProvider>
      </div>
    );

    await act(async () => {
      screen.getByText('Open Popover').click();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await act(async () => {
      fireEvent.mouseDown(screen.getByTestId('outside'));
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not close on outside click when dismissible=false', async () => {
    render(
      <div>
        <div data-testid="outside">outside</div>
        <PopoverProvider>
          <PopoverButton dismissible={false} onResult={() => undefined} />
        </PopoverProvider>
      </div>
    );

    await act(async () => {
      screen.getByText('Open Popover').click();
    });
    await act(async () => {
      fireEvent.mouseDown(screen.getByTestId('outside'));
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it.each(['top', 'bottom', 'left', 'right'] as const)('positions on %s side', async (side) => {
    function SidePopover() {
      const popover = usePopover();
      const ref = React.useRef<HTMLButtonElement>(null);
      return (
        <button
          ref={ref}
          onClick={() => {
            popover.open({
              anchor: ref as React.RefObject<HTMLElement>,
              side,
              content: () => <span>{side}-content</span>,
            });
          }}
        >
          Open {side}
        </button>
      );
    }

    render(
      <PopoverProvider>
        <SidePopover />
      </PopoverProvider>
    );

    await act(async () => {
      screen.getByText(`Open ${side}`).click();
    });

    const panel = document.querySelector(`[data-side="${side}"]`);
    expect(panel).not.toBeNull();
  });

  it.each(['start', 'center', 'end'] as const)('positions with align=%s', async (align) => {
    function AlignedPopover() {
      const popover = usePopover();
      const ref = React.useRef<HTMLButtonElement>(null);
      return (
        <button
          ref={ref}
          onClick={() => {
            popover.open({
              anchor: ref as React.RefObject<HTMLElement>,
              align,
              content: () => <span>{align}-aligned</span>,
            });
          }}
        >
          Open {align}
        </button>
      );
    }

    render(
      <PopoverProvider>
        <AlignedPopover />
      </PopoverProvider>
    );

    await act(async () => {
      screen.getByText(`Open ${align}`).click();
    });

    const panel = document.querySelector(`[data-align="${align}"]`);
    expect(panel).not.toBeNull();
  });

  it('throws when usePopover is called outside PopoverProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => {
      render(<PopoverButton onResult={() => undefined} />);
    }).toThrow(/PopoverProvider/);
    spy.mockRestore();
  });

  it('resolves pending promises with null on provider unmount', async () => {
    const results: unknown[] = [];

    function App() {
      const popover = usePopover();
      const ref = React.useRef<HTMLButtonElement>(null);
      return (
        <button
          ref={ref}
          onClick={() => {
            const handle = popover.open({
              anchor: ref as React.RefObject<HTMLElement>,
              content: () => <span>Body</span>,
            });
            handle.result.then((v) => results.push(v));
          }}
        >
          Open
        </button>
      );
    }

    const { unmount } = render(
      <PopoverProvider>
        <App />
      </PopoverProvider>
    );

    await act(async () => {
      screen.getByText('Open').click();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    unmount();
    await act(async () => {
      await Promise.resolve();
    });

    expect(results).toEqual([null]);
  });
});
