import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { PhoneInput } from './PhoneInput';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('PhoneInput', () => {
  it('renders without errors', () => {
    const { container } = render(<PhoneInput />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<PhoneInput label="Phone number" />);
    expect(screen.getByText('Phone number')).toBeInTheDocument();
  });

  it('renders a telephone input', () => {
    render(<PhoneInput />);
    expect(document.querySelector('input[type="tel"]')).toBeInTheDocument();
  });

  it('renders dial code selector', () => {
    render(<PhoneInput />);
    expect(screen.getByRole('combobox', { name: 'Country dial code' })).toBeInTheDocument();
  });

  it('shows default dial code', () => {
    render(<PhoneInput defaultDialCode="+44" />);
    const select = screen.getByRole('combobox', { name: 'Country dial code' }) as HTMLSelectElement;
    expect(select.value).toBe('+44');
  });

  it('is disabled when disabled prop is set', () => {
    render(<PhoneInput disabled />);
    expect(document.querySelector('input[type="tel"]')).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Country dial code' })).toBeDisabled();
  });

  it('calls onChange when phone number changes', async () => {
    const handleChange = vi.fn();
    render(<PhoneInput onChange={handleChange} />);
    const input = document.querySelector('input[type="tel"]') as HTMLInputElement;
    await userEvent.type(input, '5551234567');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders error message', () => {
    render(<PhoneInput validationState="error" errorMessage="Invalid phone number" />);
    expect(screen.getByText('Invalid phone number')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(<PhoneInput helperText="Include country code" />);
    expect(screen.getByText('Include country code')).toBeInTheDocument();
  });

  it('forwards ref to tel input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<PhoneInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('calls onChange when dial code changes', async () => {
    const handleChange = vi.fn();
    render(<PhoneInput onChange={handleChange} />);
    const select = screen.getByRole('combobox', { name: 'Country dial code' });
    await userEvent.selectOptions(select, '+44');
    expect(handleChange).toHaveBeenCalled();
  });

  it('works in controlled mode for phone value', async () => {
    const handleChange = vi.fn();
    render(<PhoneInput phoneValue="1234567890" onChange={handleChange} />);
    const input = document.querySelector('input[type="tel"]') as HTMLInputElement;
    await userEvent.type(input, '1');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders success message', () => {
    render(<PhoneInput validationState="success" successMessage="Valid number!" />);
    expect(screen.getByText('Valid number!')).toBeInTheDocument();
  });

  it('renders warning message', () => {
    render(<PhoneInput validationState="warning" warningMessage="Check your number" />);
    expect(screen.getByText('Check your number')).toBeInTheDocument();
  });

  it('renders with fullWidth and required label', () => {
    render(<PhoneInput label="Phone" fullWidth required />);
    expect(screen.getByText('Phone')).toBeInTheDocument();
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<PhoneInput label="Phone number" />);
    await expectNoA11yViolations(container);
  });
});
