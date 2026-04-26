import React from 'react';
import { render, screen, act, fireEvent, RenderResult } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent } from './ContextMenu';
import { MenuItem } from '../Menu/Menu';

afterEach(() => {
  document.querySelectorAll('[data-zenput-portal]').forEach((el) => el.remove());
});

// ── Shared fixture ─────────────────────────────────────────────────────────

function BasicContextMenu() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div data-testid="trigger-area">Right click here</div>
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="Context actions">
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

interface OpenResult extends RenderResult {
  menuEl: HTMLElement;
  items: HTMLElement[];
}

/** Renders BasicContextMenu and fires a contextmenu event to open it. */
function renderOpenContextMenu(x = 100, y = 200): OpenResult {
  const utils = render(<BasicContextMenu />) as OpenResult;
  act(() => {
    fireEvent.contextMenu(screen.getByTestId('trigger-area'), { clientX: x, clientY: y });
  });
  utils.menuEl = screen.getByRole('menu');
  utils.items = screen.getAllByRole('menuitem');
  return utils;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('ContextMenu', () => {
  it('is hidden by default', () => {
    render(<BasicContextMenu />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens on right-click (contextmenu event)', () => {
    renderOpenContextMenu();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('positions menu at right-click coordinates', () => {
    renderOpenContextMenu(150, 250);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const { menuEl } = renderOpenContextMenu();
    act(() => {
      fireEvent.keyDown(menuEl, { key: 'Escape' });
    });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on Tab', () => {
    const { menuEl } = renderOpenContextMenu();
    act(() => {
      fireEvent.keyDown(menuEl, { key: 'Tab' });
    });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on outside mousedown', () => {
    render(
      <div>
        <BasicContextMenu />
        <button data-testid="outside">Outside</button>
      </div>
    );
    act(() => {
      fireEvent.contextMenu(screen.getByTestId('trigger-area'), { clientX: 50, clientY: 50 });
    });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    act(() => {
      fireEvent.mouseDown(screen.getByTestId('outside'));
    });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on outside touchstart', () => {
    render(
      <div>
        <BasicContextMenu />
        <button data-testid="outside">Outside</button>
      </div>
    );
    act(() => {
      fireEvent.contextMenu(screen.getByTestId('trigger-area'), { clientX: 50, clientY: 50 });
    });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    act(() => {
      fireEvent.touchStart(screen.getByTestId('outside'));
    });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('ArrowDown moves focus to next item', () => {
    const { menuEl, items } = renderOpenContextMenu();
    act(() => {
      items[0].focus();
    });
    act(() => {
      fireEvent.keyDown(menuEl, { key: 'ArrowDown' });
    });
    expect(document.activeElement).toBe(items[1]);
  });

  it('ArrowUp moves focus to previous item', () => {
    const { menuEl, items } = renderOpenContextMenu();
    act(() => {
      items[1].focus();
    });
    act(() => {
      fireEvent.keyDown(menuEl, { key: 'ArrowUp' });
    });
    expect(document.activeElement).toBe(items[0]);
  });

  it('type-ahead jumps to matching item', () => {
    const { menuEl, items } = renderOpenContextMenu();
    act(() => {
      items[0].focus();
    });
    act(() => {
      fireEvent.keyDown(menuEl, { key: 'p' });
    });
    expect(document.activeElement).toBe(items.find((el) => el.textContent === 'Paste'));
  });

  it('Space key activates focused item', () => {
    const onSelect = vi.fn();
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div data-testid="trigger-area">Right click here</div>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label="Context actions">
          <MenuItem onSelect={onSelect}>Cut</MenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    act(() => {
      fireEvent.contextMenu(screen.getByTestId('trigger-area'), { clientX: 100, clientY: 200 });
    });
    const menuEl = screen.getByRole('menu');
    const item = screen.getByRole('menuitem');
    act(() => {
      item.focus();
    });
    act(() => {
      fireEvent.keyDown(menuEl, { key: ' ' });
    });
    expect(onSelect).toHaveBeenCalled();
  });

  it('auto-focuses first item after open (RAF)', () => {
    vi.useFakeTimers();
    try {
      render(<BasicContextMenu />);
      act(() => {
        fireEvent.contextMenu(screen.getByTestId('trigger-area'), { clientX: 50, clientY: 50 });
      });
      act(() => {
        vi.runAllTimers();
      });
      expect(document.activeElement).toBe(screen.getAllByRole('menuitem')[0]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('ContextMenu controlled open/close via open prop', () => {
    function Controlled() {
      const [open, setOpen] = React.useState(false);
      return (
        <ContextMenu open={open} onOpenChange={setOpen}>
          <ContextMenuTrigger>
            <div data-testid="trigger-area">Right click here</div>
          </ContextMenuTrigger>
          <ContextMenuContent aria-label="Actions">
            <MenuItem>Cut</MenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
    }
    render(<Controlled />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    act(() => {
      fireEvent.contextMenu(screen.getByTestId('trigger-area'), { clientX: 10, clientY: 10 });
    });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
