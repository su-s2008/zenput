import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { EmptyState } from './EmptyState';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('EmptyState', () => {
  it('renders without crashing', () => {
    const { container } = render(<EmptyState title="No data" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(<EmptyState title="No results" description="Try a different filter." />);
    expect(screen.getByText('Try a different filter.')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    render(<EmptyState title="No results" />);
    expect(screen.queryByText(/filter/i)).not.toBeInTheDocument();
  });

  it('renders the icon when provided', () => {
    render(<EmptyState title="Empty" icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders a button for primary action with onClick', async () => {
    const onClick = vi.fn();
    render(<EmptyState title="Empty" primaryAction={{ label: 'Do something', onClick }} />);
    const btn = screen.getByRole('button', { name: 'Do something' });
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders a link for secondary action with href', () => {
    render(<EmptyState title="Empty" secondaryAction={{ label: 'Learn more', href: '/docs' }} />);
    const link = screen.getByRole('link', { name: 'Learn more' });
    expect(link).toHaveAttribute('href', '/docs');
  });

  it('renders nothing for an action with neither onClick nor href', () => {
    render(<EmptyState title="Empty" primaryAction={{ label: 'Broken' }} />);
    expect(screen.queryByRole('button', { name: 'Broken' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Broken' })).not.toBeInTheDocument();
    expect(screen.queryByText('Broken')).not.toBeInTheDocument();
  });

  it('has role="status" and aria-live="polite"', () => {
    render(<EmptyState title="No results" />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('passes a11y checks with no icon', async () => {
    const { container } = render(<EmptyState title="No data" description="Nothing to show." />);
    await expectNoA11yViolations(container);
  });

  it('passes a11y checks with actions', async () => {
    const { container } = render(
      <EmptyState
        title="No results"
        description="Try something else."
        primaryAction={{ label: 'Retry', onClick: () => undefined }}
        secondaryAction={{ label: 'Learn more', href: '#' }}
      />
    );
    await expectNoA11yViolations(container);
  });
});
