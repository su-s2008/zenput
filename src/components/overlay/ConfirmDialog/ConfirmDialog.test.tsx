import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

function setup(props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) {
  const onOpenChange = vi.fn();
  const onConfirm = vi.fn();
  const view = render(
    <ConfirmDialog
      open
      onOpenChange={onOpenChange}
      title="Delete item"
      description="This cannot be undone."
      onConfirm={onConfirm}
      {...props}
    />
  );
  return { ...view, onOpenChange, onConfirm };
}

describe('ConfirmDialog', () => {
  it('renders title, description, and default button labels', () => {
    setup();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete item')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('uses custom button labels when provided', () => {
    setup({ confirmLabel: 'Delete', cancelLabel: 'Keep' });
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
  });

  it('calls onConfirm then closes on confirm click', async () => {
    const { onConfirm, onOpenChange } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('calls onOpenChange(false) on cancel click', async () => {
    const { onOpenChange } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows loading state while onConfirm is pending and stays open', async () => {
    let resolveFn: (() => void) | null = null;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolveFn = r;
        })
    );
    const { onOpenChange } = setup({ onConfirm });

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    // Confirm button should be aria-busy while pending.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute('aria-busy', 'true')
    );
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    resolveFn?.();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('stays open if onConfirm rejects', async () => {
    const onConfirm = vi.fn(() => Promise.reject(new Error('boom')));
    const { onOpenChange } = setup({ onConfirm });
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    // Loading state cleared, dialog still open.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Confirm' })).not.toHaveAttribute(
        'aria-busy',
        'true'
      )
    );
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('respects confirmDisabled', async () => {
    const { onConfirm } = setup({ confirmDisabled: true });
    const btn = screen.getByRole('button', { name: 'Confirm' });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('renders extra children between description and footer', () => {
    setup({ children: <div data-testid="extra">type DELETE</div> });
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });
});
