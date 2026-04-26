import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { TextInput } from './TextInput';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('TextInput', () => {
  it('renders without errors', () => {
    const { container } = render(<TextInput />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<TextInput label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<TextInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor/id', () => {
    render(<TextInput label="Email" />);
    const label = screen.getByText('Email');
    const input = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('renders error message when validationState is error', () => {
    render(<TextInput validationState="error" errorMessage="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('sets aria-invalid when validationState is error', () => {
    render(<TextInput validationState="error" errorMessage="Error" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-required when required', () => {
    render(<TextInput required />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
  });

  it('is disabled when disabled prop is set', () => {
    render(<TextInput disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('is readOnly when readOnly prop is set', () => {
    render(<TextInput readOnly />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('calls onChange when user types', async () => {
    const handleChange = vi.fn();
    render(<TextInput onChange={handleChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders helper text', () => {
    render(<TextInput helperText="This is a hint" />);
    expect(screen.getByText('This is a hint')).toBeInTheDocument();
  });

  it('renders success message when validationState is success', () => {
    render(<TextInput validationState="success" successMessage="Looks good!" />);
    expect(screen.getByText('Looks good!')).toBeInTheDocument();
  });

  it('renders warning message when validationState is warning', () => {
    render(<TextInput validationState="warning" warningMessage="Please double-check" />);
    expect(screen.getByText('Please double-check')).toBeInTheDocument();
  });

  it('renders prefix and suffix icons', () => {
    render(<TextInput prefixIcon={<span>@</span>} suffixIcon={<span>✓</span>} />);
    expect(screen.getByText('@')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<TextInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<TextInput label="Username" />);
    await expectNoA11yViolations(container);
  });
});
