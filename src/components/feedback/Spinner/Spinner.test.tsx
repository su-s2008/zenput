import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';
import { expectNoA11yViolations } from '../../../test-utils/axe';

describe('Spinner', () => {
  it('renders with role="status" by default', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the default accessible label', () => {
    render(<Spinner />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders a custom label', () => {
    render(<Spinner label="Cargando…" />);
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('omits role when label is empty string', () => {
    render(<Spinner label="" />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('applies size class', () => {
    render(<Spinner data-testid="s" size="lg" />);
    expect(screen.getByTestId('s').className).toMatch(/size-lg/);
  });

  it('applies custom thickness via inline style', () => {
    render(<Spinner data-testid="s" thickness="4px" />);
    const el = screen.getByTestId('s');
    expect(el.style.borderWidth).toBe('4px');
  });
});

describe('Spinner a11y (axe)', () => {
  it('has no detectable axe violations', async () => {
    const { container } = render(<Spinner label="Loading…" />);
    await expectNoA11yViolations(container);
  });
});
