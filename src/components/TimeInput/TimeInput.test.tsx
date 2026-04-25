import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { TimeInput } from './TimeInput';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('TimeInput', () => {
  it('renders without errors', () => {
    render(<TimeInput />);
  });

  it('renders with label', () => {
    render(<TimeInput label="Meeting time" />);
    expect(screen.getByText('Meeting time')).toBeInTheDocument();
  });

  it('renders as type="time"', () => {
    render(<TimeInput />);
    expect(document.querySelector('input[type="time"]')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is set', () => {
    render(<TimeInput disabled />);
    expect(document.querySelector('input')).toBeDisabled();
  });

  it('respects min and max attributes', () => {
    render(<TimeInput min="09:00" max="17:00" />);
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input).toHaveAttribute('min', '09:00');
    expect(input).toHaveAttribute('max', '17:00');
  });

  it('sets aria-required when required', () => {
    render(<TimeInput required />);
    expect(document.querySelector('input')).toHaveAttribute('aria-required', 'true');
  });

  it('renders error message', () => {
    render(<TimeInput validationState="error" errorMessage="Invalid time" />);
    expect(screen.getByText('Invalid time')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(<TimeInput helperText="24-hour format" />);
    expect(screen.getByText('24-hour format')).toBeInTheDocument();
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<TimeInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('renders success message', () => {
    render(<TimeInput validationState="success" successMessage="Looks good!" />);
    expect(screen.getByText('Looks good!')).toBeInTheDocument();
  });

  it('renders warning message', () => {
    render(<TimeInput validationState="warning" warningMessage="Outside business hours" />);
    expect(screen.getByText('Outside business hours')).toBeInTheDocument();
  });

  it('renders required label', () => {
    render(<TimeInput label="Start time" required />);
    expect(screen.getByText('Start time')).toBeInTheDocument();
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<TimeInput label="Meeting time" />);
    await expectNoA11yViolations(container);
  });
});
