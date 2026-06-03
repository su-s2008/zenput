import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { Alert } from './Alert';
import { expectNoA11yViolations } from '../../../test-utils/axe';

describe('Alert', () => {
  it('renders title and description', () => {
    render(<Alert title="Saved">Your changes have been saved.</Alert>);
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Your changes have been saved.')).toBeInTheDocument();
  });

  it('uses role="status" for non-error tones', () => {
    render(<Alert tone="info" title="Heads up" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses role="alert" for error tone by default', () => {
    render(<Alert tone="error" title="Oh no" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('honours explicit assertive override', () => {
    render(<Alert tone="info" assertive title="Important" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders the default icon for the tone', () => {
    const { container } = render(<Alert tone="success" title="Done" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('suppresses the icon when icon={null}', () => {
    const { container } = render(<Alert tone="success" title="Done" icon={null} />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders a custom icon', () => {
    render(<Alert tone="info" title="Hi" icon={<svg data-testid="custom-icon" />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders the action slot', () => {
    render(
      <Alert tone="error" title="Failed" action={<button type="button">Retry</button>}>
        Something went wrong.
      </Alert>
    );
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('shows a dismiss button when onDismiss is provided', async () => {
    const onDismiss = vi.fn();
    render(<Alert title="Bye" onDismiss={onDismiss} />);
    const btn = screen.getByRole('button', { name: 'Dismiss' });
    await userEvent.click(btn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render a dismiss button when onDismiss is omitted', () => {
    render(<Alert title="Static" />);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('uses a localized dismiss label', () => {
    render(<Alert title="x" onDismiss={() => undefined} dismissLabel="Cerrar" />);
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('passes a11y checks (subtle info)', async () => {
    const { container } = render(
      <Alert tone="info" title="Heads up">
        Saved as draft.
      </Alert>
    );
    await expectNoA11yViolations(container);
  });

  it('passes a11y checks (error with action and dismiss)', async () => {
    const { container } = render(
      <Alert
        tone="error"
        title="Failed"
        action={<button type="button">Retry</button>}
        onDismiss={() => undefined}
      >
        Network unreachable.
      </Alert>
    );
    await expectNoA11yViolations(container);
  });
});
