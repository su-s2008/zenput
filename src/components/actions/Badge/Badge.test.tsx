import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children by default', () => {
    render(<Badge>new</Badge>);
    expect(screen.getByText('new')).toBeInTheDocument();
  });

  it('applies tone, variant, and size classes', () => {
    render(
      <Badge data-testid="b" tone="danger" variant="solid" size="lg">
        x
      </Badge>
    );
    const el = screen.getByTestId('b');
    expect(el.className).toMatch(/tone-danger/);
    expect(el.className).toMatch(/variant-solid/);
    expect(el.className).toMatch(/size-lg/);
  });

  it('renders numeric count', () => {
    render(<Badge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('hides by default when count is 0', () => {
    const { container } = render(<Badge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders 0 when showZero is set', () => {
    render(<Badge count={0} showZero />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('caps count at max', () => {
    render(<Badge count={250} max={99} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('renders a dot with no content', () => {
    render(
      <Badge data-testid="b" dot>
        should-not-render
      </Badge>
    );
    const el = screen.getByTestId('b');
    expect(el.className).toMatch(/dot/);
    expect(el.textContent).toBe('');
  });
});
