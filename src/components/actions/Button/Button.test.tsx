import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders as a button with default type="button"', () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole('button', { name: 'Click' });
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('applies variant and size classes', () => {
    render(
      <Button variant="danger" size="lg">
        x
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/variant-danger/);
    expect(btn.className).toMatch(/size-lg/);
  });

  it('fires onClick', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>go</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and does not fire onClick when disabled', () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        x
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('sets aria-busy and keeps the accessible name from the content when loading', () => {
    render(<Button loading>Saving</Button>);
    const btn = screen.getByRole('button', { name: 'Saving' });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
    expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
    // No extra role="status" live region (would duplicate announcements).
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('uses loadingLabel to override the accessible name while loading', () => {
    render(
      <Button loading loadingLabel="Guardando…">
        Save
      </Button>
    );
    // aria-label takes precedence while loading.
    expect(
      screen.getByRole('button', { name: 'Guardando…' })
    ).toBeInTheDocument();
  });

  it('renders icons on both sides', () => {
    render(
      <Button
        leftIcon={<span data-testid="l">L</span>}
        rightIcon={<span data-testid="r">R</span>}
      >
        Label
      </Button>
    );
    expect(screen.getByTestId('l')).toBeInTheDocument();
    expect(screen.getByTestId('r')).toBeInTheDocument();
  });

  it('applies iconOnly class when iconOnly is set', () => {
    render(
      <Button iconOnly aria-label="close">
        <span>×</span>
      </Button>
    );
    expect(screen.getByRole('button').className).toMatch(/iconOnly/);
  });

  it('respects a custom type', () => {
    render(<Button type="submit">s</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
