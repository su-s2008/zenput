import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ColorInput } from './ColorInput';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('ColorInput', () => {
  it('renders without errors', () => {
    const { container } = render(<ColorInput />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<ColorInput label="Brand color" />);
    expect(screen.getByText('Brand color')).toBeInTheDocument();
  });

  it('renders as type="color"', () => {
    render(<ColorInput />);
    expect(document.querySelector('input[type="color"]')).toBeInTheDocument();
  });

  it('shows hex value by default', () => {
    render(<ColorInput defaultValue="#FF5733" />);
    expect(screen.getByText('#FF5733')).toBeInTheDocument();
  });

  it('hides hex value when showHexValue is false', () => {
    render(<ColorInput defaultValue="#FF5733" showHexValue={false} />);
    expect(screen.queryByText('#FF5733')).not.toBeInTheDocument();
  });

  it('is disabled when disabled prop is set', () => {
    render(<ColorInput disabled />);
    expect(document.querySelector('input')).toBeDisabled();
  });

  it('renders error message', () => {
    render(<ColorInput validationState="error" errorMessage="Color required" />);
    expect(screen.getByText('Color required')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(<ColorInput helperText="Choose your brand color" />);
    expect(screen.getByText('Choose your brand color')).toBeInTheDocument();
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<ColorInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('updates internal color on change in uncontrolled mode', () => {
    render(<ColorInput defaultValue="#FF5733" showHexValue />);
    const input = document.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '#00FF00' } });
    expect(screen.getByText('#00FF00')).toBeInTheDocument();
  });

  it('calls onChange when color changes', () => {
    const handleChange = vi.fn();
    render(<ColorInput onChange={handleChange} />);
    const input = document.querySelector('input[type="color"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '#123456' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('works in controlled mode and does not update internal state', () => {
    const handleChange = vi.fn();
    render(<ColorInput value="#aabbcc" onChange={handleChange} showHexValue />);
    const input = document.querySelector('input[type="color"]') as HTMLInputElement;
    expect(input).toHaveValue('#aabbcc');
    fireEvent.change(input, { target: { value: '#112233' } });
    expect(handleChange).toHaveBeenCalled();
    // The displayed value stays controlled (still shows original controlled value uppercased)
    expect(screen.getByText('#AABBCC')).toBeInTheDocument();
  });

  it('renders success message', () => {
    render(<ColorInput validationState="success" successMessage="Color applied!" />);
    expect(screen.getByText('Color applied!')).toBeInTheDocument();
  });

  it('renders warning message', () => {
    render(<ColorInput validationState="warning" warningMessage="Low contrast" />);
    expect(screen.getByText('Low contrast')).toBeInTheDocument();
  });

  it('renders with fullWidth', () => {
    const { container } = render(<ColorInput fullWidth />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders required indicator when required', () => {
    render(<ColorInput label="Color" required />);
    const label = screen.getByText('Color');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<ColorInput label="Brand color" />);
    await expectNoA11yViolations(container);
  });
});
