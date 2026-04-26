import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
} from './Drawer';

afterEach(() => {
  document.querySelectorAll('[data-zenput-portal]').forEach((el) => el.remove());
});

function BasicDrawer({ side }: { side?: 'left' | 'right' | 'top' | 'bottom' }) {
  return (
    <Drawer>
      <DrawerTrigger>Open drawer</DrawerTrigger>
      <DrawerContent side={side}>
        <DrawerHeader>
          <DrawerTitle>Drawer title</DrawerTitle>
          <DrawerDescription>Drawer description</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <button data-testid="inner">Inner</button>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

describe('Drawer', () => {
  it('opens on trigger click and renders role=dialog with aria-modal', () => {
    render(<BasicDrawer />);
    act(() => {
      screen.getByRole('button', { name: 'Open drawer' }).click();
    });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('wires aria-labelledby and aria-describedby from title/description', () => {
    render(<BasicDrawer />);
    act(() => {
      screen.getByRole('button', { name: 'Open drawer' }).click();
    });
    const dialog = screen.getByRole('dialog');
    const labelId = dialog.getAttribute('aria-labelledby');
    const descId = dialog.getAttribute('aria-describedby');
    expect(labelId).toBeTruthy();
    expect(descId).toBeTruthy();
    expect(document.getElementById(labelId!)).toHaveTextContent('Drawer title');
    expect(document.getElementById(descId!)).toHaveTextContent('Drawer description');
  });

  it.each(['left', 'right', 'top', 'bottom'] as const)('applies side=%s via data-side', (side) => {
    render(<BasicDrawer side={side} />);
    act(() => {
      screen.getByRole('button', { name: 'Open drawer' }).click();
    });
    expect(screen.getByRole('dialog')).toHaveAttribute('data-side', side);
  });

  it('closes on Escape', () => {
    render(<BasicDrawer />);
    act(() => {
      screen.getByRole('button', { name: 'Open drawer' }).click();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on backdrop click', () => {
    render(<BasicDrawer />);
    act(() => {
      screen.getByRole('button', { name: 'Open drawer' }).click();
    });
    const overlay = document.querySelector<HTMLElement>('[data-zp-drawer-overlay]');
    expect(overlay).not.toBeNull();
    act(() => {
      fireEvent.mouseDown(overlay!);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not close on Escape when closeOnEscape=false', () => {
    render(
      <Drawer defaultOpen closeOnEscape={false}>
        <DrawerContent aria-label="locked">
          <DrawerBody>body</DrawerBody>
        </DrawerContent>
      </Drawer>
    );
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not close on backdrop click when closeOnOverlayClick=false', () => {
    render(
      <Drawer defaultOpen closeOnOverlayClick={false}>
        <DrawerContent aria-label="locked">
          <DrawerBody>body</DrawerBody>
        </DrawerContent>
      </Drawer>
    );
    const overlay = document.querySelector<HTMLElement>('[data-zp-drawer-overlay]');
    expect(overlay).not.toBeNull();
    act(() => {
      fireEvent.mouseDown(overlay!);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes when DrawerClose is clicked', () => {
    render(<BasicDrawer />);
    act(() => {
      screen.getByRole('button', { name: 'Open drawer' }).click();
    });
    act(() => {
      screen.getByRole('button', { name: 'Close' }).click();
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('throws when DrawerContent is used outside Drawer', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <DrawerContent>
          <DrawerBody>body</DrawerBody>
        </DrawerContent>
      )
    ).toThrow();
    spy.mockRestore();
  });

  it('warns when DrawerContent has no accessible name', () => {
    vi.useFakeTimers();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      render(
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerBody>body without title</DrawerBody>
          </DrawerContent>
        </Drawer>
      );

      act(() => {
        vi.runAllTimers();
      });

      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('accessible name'));
    } finally {
      warnSpy.mockRestore();
      vi.useRealTimers();
    }
  });
});
