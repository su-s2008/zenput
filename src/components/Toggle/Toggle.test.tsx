import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { Toggle } from './Toggle';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('Toggle', () => {
  it('renders without errors', () => {
    const { container } = render(<Toggle />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Toggle label="Enable notifications" />);
    expect(screen.getByText('Enable notifications')).toBeInTheDocument();
  });

  it('is off by default', () => {
    render(<Toggle label="Toggle" />);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('is on when defaultChecked is true', () => {
    render(<Toggle label="Toggle" defaultChecked />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('toggles when clicked', async () => {
    render(<Toggle label="Toggle" />);
    const toggle = screen.getByRole('switch');
    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it('is disabled when disabled prop is set', () => {
    render(<Toggle label="Toggle" disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('calls onChange when toggled', async () => {
    const handleChange = vi.fn();
    render(<Toggle label="Toggle" onChange={handleChange} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders helper text', () => {
    render(<Toggle helperText="This enables email notifications" />);
    expect(screen.getByText('This enables email notifications')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<Toggle validationState="error" errorMessage="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Toggle ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<Toggle label="Enable notifications" />);
    await expectNoA11yViolations(container);
  });
});
