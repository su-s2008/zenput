import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { NumberInput } from './NumberInput';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('NumberInput', () => {
  it('renders without errors', () => {
    render(<NumberInput />);
  });

  it('renders with label', () => {
    render(<NumberInput label="Quantity" />);
    expect(screen.getByText('Quantity')).toBeInTheDocument();
  });

  it('renders increment and decrement buttons', () => {
    render(<NumberInput />);
    expect(screen.getByLabelText('Increment')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrement')).toBeInTheDocument();
  });

  it('hides controls when hideControls is true', () => {
    render(<NumberInput hideControls />);
    expect(screen.queryByLabelText('Increment')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Decrement')).not.toBeInTheDocument();
  });

  it('increments value when increment button is clicked', async () => {
    render(<NumberInput defaultValue={5} step={1} />);
    await userEvent.click(screen.getByLabelText('Increment'));
    expect(screen.getByRole('spinbutton')).toHaveValue(6);
  });

  it('decrements value when decrement button is clicked', async () => {
    render(<NumberInput defaultValue={5} step={1} />);
    await userEvent.click(screen.getByLabelText('Decrement'));
    expect(screen.getByRole('spinbutton')).toHaveValue(4);
  });

  it('respects min value', async () => {
    render(<NumberInput defaultValue={1} min={1} step={1} />);
    expect(screen.getByLabelText('Decrement')).toBeDisabled();
  });

  it('respects max value', async () => {
    render(<NumberInput defaultValue={10} max={10} step={1} />);
    expect(screen.getByLabelText('Increment')).toBeDisabled();
  });

  it('is disabled when disabled prop is set', () => {
    render(<NumberInput disabled />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('calls onChange with numeric value', async () => {
    const handleChange = vi.fn();
    render(<NumberInput onChange={handleChange} />);
    await userEvent.type(screen.getByRole('spinbutton'), '42');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders error message', () => {
    render(<NumberInput validationState="error" errorMessage="Invalid number" />);
    expect(screen.getByText('Invalid number')).toBeInTheDocument();
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<NumberInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('displays formatted value when formatValue is provided and not focused', () => {
    render(
      <NumberInput
        value={1234.5}
        formatValue={(v) => `$${v.toFixed(2)}`}
        onChange={() => undefined}
      />
    );
    expect(screen.getByDisplayValue('$1234.50')).toBeInTheDocument();
  });

  it('clears value when input is emptied', async () => {
    render(<NumberInput defaultValue={5} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.clear(input);
    expect(input).toHaveValue(null);
  });

  it('calls onBlur when input loses focus', async () => {
    const handleBlur = vi.fn();
    render(<NumberInput onBlur={handleBlur} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.click(input);
    await userEvent.tab();
    expect(handleBlur).toHaveBeenCalled();
  });

  it('calls onFocus when input is focused', async () => {
    const handleFocus = vi.fn();
    render(<NumberInput onFocus={handleFocus} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.click(input);
    expect(handleFocus).toHaveBeenCalled();
  });

  it('renders success message', () => {
    render(<NumberInput validationState="success" successMessage="Valid number!" />);
    expect(screen.getByText('Valid number!')).toBeInTheDocument();
  });

  it('renders warning message', () => {
    render(<NumberInput validationState="warning" warningMessage="Value may be high" />);
    expect(screen.getByText('Value may be high')).toBeInTheDocument();
  });

  it('renders with fullWidth and required label', () => {
    render(<NumberInput label="Amount" fullWidth required />);
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<NumberInput label="Quantity" />);
    await expectNoA11yViolations(container);
  });
});
