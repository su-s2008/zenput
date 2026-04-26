import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tag, Chip } from './Tag';
import { expectNoA11yViolations } from '../../../test-utils/axe';

describe('Tag', () => {
  it('renders children', () => {
    render(<Tag>Label</Tag>);
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('applies color and variant classes', () => {
    const { container } = render(
      <Tag color="brand" variant="solid">
        T
      </Tag>
    );
    const tag = container.firstChild as HTMLElement;
    expect(tag.className).toMatch(/color-brand/);
    expect(tag.className).toMatch(/variant-solid/);
  });

  it('applies size class', () => {
    const { container } = render(<Tag size="lg">T</Tag>);
    expect((container.firstChild as HTMLElement).className).toMatch(/size-lg/);
  });

  it('renders leftIcon', () => {
    render(<Tag leftIcon={<span data-testid="icon">#</span>}>T</Tag>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('shows remove button when onRemove is provided', () => {
    render(<Tag onRemove={() => {}}>Label</Tag>);
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>Label</Tag>);
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('uses custom removeLabel for accessible label', () => {
    render(
      <Tag onRemove={() => {}} removeLabel="Quitar">
        Label
      </Tag>
    );
    expect(screen.getByRole('button', { name: 'Quitar' })).toBeInTheDocument();
  });

  it('does not show remove button without onRemove', () => {
    render(<Tag>Label</Tag>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('is interactive when interactive prop is set', () => {
    const { container } = render(<Tag interactive>T</Tag>);
    const tag = container.firstChild as HTMLElement;
    expect(tag.className).toMatch(/interactive/);
    expect(tag).toHaveAttribute('role', 'button');
    expect(tag).toHaveAttribute('tabIndex', '0');
  });

  it('calls onClick when interactive and Enter key pressed', () => {
    const onClick = vi.fn();
    render(
      <Tag interactive onClick={onClick}>
        T
      </Tag>
    );
    const tag = screen.getByRole('button', { name: /T/i });
    fireEvent.keyDown(tag, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });

  it('Chip is an alias for Tag', () => {
    expect(Chip).toBe(Tag);
  });
});

describe('Tag a11y (axe)', () => {
  it('has no axe violations for default tag', async () => {
    const { container } = render(<Tag color="brand">Label</Tag>);
    await expectNoA11yViolations(container);
  });

  it('has no axe violations for closable tag', async () => {
    const { container } = render(
      <Tag color="brand" onRemove={() => {}}>
        Closable
      </Tag>
    );
    await expectNoA11yViolations(container);
  });
});
