import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { OTPInput } from './OTPInput';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('OTPInput', () => {
  it('renders without errors', () => {
    const { container } = render(<OTPInput />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<OTPInput label="Verification code" />);
    expect(screen.getByText('Verification code')).toBeInTheDocument();
  });

  it('renders the correct number of digit inputs', () => {
    render(<OTPInput length={4} />);
    const inputs = document.querySelectorAll('input');
    expect(inputs).toHaveLength(4);
  });

  it('defaults to 6 digit inputs', () => {
    render(<OTPInput />);
    const inputs = document.querySelectorAll('input');
    expect(inputs).toHaveLength(6);
  });

  it('fills in a digit when typed', async () => {
    render(<OTPInput />);
    const inputs = document.querySelectorAll('input');
    await userEvent.type(inputs[0], '3');
    expect(inputs[0]).toHaveValue('3');
  });

  it('moves focus to next input after typing', async () => {
    render(<OTPInput length={4} />);
    const inputs = document.querySelectorAll('input');
    await userEvent.type(inputs[0], '1');
    expect(inputs[1]).toHaveFocus();
  });

  it('calls onChange when a digit is entered', async () => {
    const handleChange = vi.fn();
    render(<OTPInput length={4} onChange={handleChange} />);
    const inputs = document.querySelectorAll('input');
    await userEvent.type(inputs[0], '5');
    expect(handleChange).toHaveBeenCalledWith('5');
  });

  it('calls onComplete when all digits are filled', async () => {
    const handleComplete = vi.fn();
    render(<OTPInput length={4} onComplete={handleComplete} />);
    const inputs = document.querySelectorAll('input');
    await userEvent.type(inputs[0], '1');
    await userEvent.type(inputs[1], '2');
    await userEvent.type(inputs[2], '3');
    await userEvent.type(inputs[3], '4');
    expect(handleComplete).toHaveBeenCalledWith('1234');
  });

  it('is disabled when disabled prop is set', () => {
    render(<OTPInput disabled />);
    document.querySelectorAll('input').forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it('renders error message', () => {
    render(<OTPInput validationState="error" errorMessage="Invalid code" />);
    expect(screen.getByText('Invalid code')).toBeInTheDocument();
  });

  it('forwards ref to wrapper div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<OTPInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('handles Backspace on filled digit', async () => {
    render(<OTPInput length={4} />);
    const inputs = document.querySelectorAll('input');
    await userEvent.type(inputs[0], '5');
    await userEvent.keyboard('{Backspace}');
    expect(inputs[0]).toHaveValue('');
  });

  it('moves focus to previous input on Backspace when current is empty', async () => {
    render(<OTPInput length={4} />);
    const inputs = document.querySelectorAll('input');
    await userEvent.type(inputs[0], '1');
    await userEvent.type(inputs[1], '2');
    inputs[1].focus();
    // Clear second input first
    await userEvent.keyboard('{Backspace}');
    // Second digit was '2', so first Backspace clears it
    expect(inputs[1]).toHaveValue('');
    // Second Backspace moves focus back to inputs[0]
    await userEvent.keyboard('{Backspace}');
    expect(inputs[0]).toHaveFocus();
  });

  it('navigates left with ArrowLeft key', async () => {
    render(<OTPInput length={4} />);
    const inputs = document.querySelectorAll('input');
    await userEvent.type(inputs[1], '2');
    inputs[1].focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(inputs[0]).toHaveFocus();
  });

  it('navigates right with ArrowRight key', async () => {
    render(<OTPInput length={4} />);
    const inputs = document.querySelectorAll('input');
    inputs[0].focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(inputs[1]).toHaveFocus();
  });

  it('handles paste of valid digits', async () => {
    const handleComplete = vi.fn();
    render(<OTPInput length={4} onComplete={handleComplete} />);
    const inputs = document.querySelectorAll('input');
    inputs[0].focus();
    await userEvent.paste('1234');
    expect(handleComplete).toHaveBeenCalledWith('1234');
  });

  it('ignores invalid characters on input (numeric mode)', async () => {
    render(<OTPInput length={4} inputType="numeric" />);
    const inputs = document.querySelectorAll('input');
    await userEvent.type(inputs[0], 'a');
    expect(inputs[0]).toHaveValue('');
  });

  it('allows alphanumeric input in alphanumeric mode', async () => {
    render(<OTPInput length={4} inputType="alphanumeric" />);
    const inputs = document.querySelectorAll('input');
    await userEvent.type(inputs[0], 'A');
    expect(inputs[0]).toHaveValue('A');
  });

  it('renders with mask (password type)', () => {
    render(<OTPInput mask />);
    const inputs = document.querySelectorAll('input[type="password"]');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders helper text', () => {
    render(<OTPInput helperText="Enter code from SMS" />);
    expect(screen.getByText('Enter code from SMS')).toBeInTheDocument();
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<OTPInput label="Verification code" />);
    await expectNoA11yViolations(container);
  });
});
