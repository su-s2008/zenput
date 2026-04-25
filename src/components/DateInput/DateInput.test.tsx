import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { DateInput } from './DateInput';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('DateInput', () => {
  it('renders without errors', () => {
    render(<DateInput />);
  });

  it('renders with label', () => {
    render(<DateInput label="Date of birth" />);
    expect(screen.getByText('Date of birth')).toBeInTheDocument();
  });

  it('renders as type="date"', () => {
    render(<DateInput />);
    expect(document.querySelector('input[type="date"]')).toBeInTheDocument();
  });

  it('associates label with input', () => {
    render(<DateInput label="Date" />);
    const label = screen.getByText('Date');
    const input = document.querySelector('input') as HTMLInputElement;
    expect(label).toHaveAttribute('for', input.id);
  });

  it('is disabled when disabled prop is set', () => {
    render(<DateInput disabled />);
    expect(document.querySelector('input')).toBeDisabled();
  });

  it('respects min and max attributes', () => {
    render(<DateInput min="2020-01-01" max="2024-12-31" />);
    const input = document.querySelector('input') as HTMLInputElement;
    expect(input).toHaveAttribute('min', '2020-01-01');
    expect(input).toHaveAttribute('max', '2024-12-31');
  });

  it('sets aria-required when required', () => {
    render(<DateInput required />);
    expect(document.querySelector('input')).toHaveAttribute('aria-required', 'true');
  });

  it('renders error message', () => {
    render(<DateInput validationState="error" errorMessage="Invalid date" />);
    expect(screen.getByText('Invalid date')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(<DateInput helperText="Select your date of birth" />);
    expect(screen.getByText('Select your date of birth')).toBeInTheDocument();
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<DateInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('renders success message', () => {
    render(<DateInput validationState="success" successMessage="Date confirmed!" />);
    expect(screen.getByText('Date confirmed!')).toBeInTheDocument();
  });

  it('renders warning message', () => {
    render(<DateInput validationState="warning" warningMessage="Date is in the past" />);
    expect(screen.getByText('Date is in the past')).toBeInTheDocument();
  });

  it('renders required label', () => {
    render(<DateInput label="Start date" required />);
    expect(screen.getByText('Start date')).toBeInTheDocument();
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<DateInput label="Date of birth" />);
    await expectNoA11yViolations(container);
  });
});
