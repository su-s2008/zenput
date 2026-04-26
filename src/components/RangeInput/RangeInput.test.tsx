import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { RangeInput } from './RangeInput';
import { expectNoA11yViolations } from '../../test-utils/axe';

describe('RangeInput', () => {
  it('renders without errors', () => {
    const { container } = render(<RangeInput />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<RangeInput label="Volume" />);
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('renders as type="range"', () => {
    render(<RangeInput />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('shows value when showValue is true', () => {
    render(<RangeInput showValue defaultValue={42} min={0} max={100} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('uses custom formatValue function', () => {
    render(<RangeInput showValue defaultValue={50} formatValue={(v) => `${v}%`} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('respects min and max attributes', () => {
    render(<RangeInput min={10} max={90} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '90');
  });

  it('is disabled when disabled prop is set', () => {
    render(<RangeInput disabled />);
    expect(screen.getByRole('slider')).toBeDisabled();
  });

  it('renders error message', () => {
    render(<RangeInput validationState="error" errorMessage="Out of range" />);
    expect(screen.getByText('Out of range')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(<RangeInput helperText="Drag to adjust" />);
    expect(screen.getByText('Drag to adjust')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<RangeInput onChange={handleChange} defaultValue={50} min={0} max={100} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '60' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<RangeInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('renders warning message', () => {
    render(<RangeInput validationState="warning" warningMessage="High value!" />);
    expect(screen.getByText('High value!')).toBeInTheDocument();
  });

  it('renders success message', () => {
    render(<RangeInput validationState="success" successMessage="Good range!" />);
    expect(screen.getByText('Good range!')).toBeInTheDocument();
  });

  it('works in controlled mode', () => {
    const handleChange = vi.fn();
    render(<RangeInput value={50} onChange={handleChange} showValue />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });
    expect(handleChange).toHaveBeenCalled();
    // Controlled: display stays at 50
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('renders with fullWidth', () => {
    const { container } = render(<RangeInput fullWidth />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with required label', () => {
    render(<RangeInput label="Volume" required />);
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });
});

describe('a11y (axe)', () => {
  it('has no detectable axe violations in default render', async () => {
    const { container } = render(<RangeInput label="Volume" />);
    await expectNoA11yViolations(container);
  });
});
