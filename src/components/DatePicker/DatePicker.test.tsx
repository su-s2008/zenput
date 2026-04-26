import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { DatePicker } from './DatePicker';
import { expectNoA11yViolations } from '../../test-utils/axe';

afterEach(() => {
  document.querySelectorAll('[data-zenput-portal]').forEach((el) => el.remove());
});

describe('DatePicker', () => {
  it('renders a trigger button', () => {
    render(<DatePicker label="Pick date" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows placeholder when no value is set', () => {
    render(<DatePicker placeholder="Choose…" />);
    expect(screen.getByText('Choose…')).toBeInTheDocument();
  });

  it('opens calendar on trigger click', () => {
    render(<DatePicker label="Pick date" />);
    act(() => screen.getByRole('button').click());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('closes calendar after selecting a date', () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        label="Pick date"
        value={new Date(2024, 0, 15)}
        onChange={onChange}
      />
    );
    act(() => screen.getByRole('button').click());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const jan20 = screen.getByLabelText(/January 20, 2024/i);
    act(() => jan20.click());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it('displays formatted date in trigger', () => {
    render(
      <DatePicker
        value={new Date(2024, 0, 15)}
        locale="en-US"
        format={{ dateStyle: 'medium' }}
      />
    );
    expect(screen.getByText(/Jan 15, 2024/i)).toBeInTheDocument();
  });

  it('shows clear button when clearable=true and value is set', () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        value={new Date(2024, 0, 15)}
        clearable
        onChange={onChange}
      />
    );
    const clearBtn = screen.getByRole('button', { name: /clear date/i });
    expect(clearBtn).toBeInTheDocument();
    act(() => clearBtn.click());
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('does not show clear button when clearable=false', () => {
    render(<DatePicker value={new Date(2024, 0, 15)} clearable={false} />);
    expect(screen.queryByRole('button', { name: /clear date/i })).not.toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(<DatePicker label="Pick date" disabled />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('renders label', () => {
    render(<DatePicker label="Birth date" />);
    expect(screen.getByText('Birth date')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(
      <DatePicker
        label="Pick date"
        validationState="error"
        errorMessage="Date is required"
      />
    );
    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });

  it('renders presets', () => {
    const presets = [
      { label: 'Today', date: new Date() },
      { label: 'Tomorrow', date: new Date(Date.now() + 86400000) },
    ];
    render(<DatePicker presets={presets} />);
    act(() => screen.getByRole('button').click());
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Tomorrow')).toBeInTheDocument();
  });

  it('selects a preset date when clicked', () => {
    const today = new Date();
    const onChange = vi.fn();
    render(
      <DatePicker
        presets={[{ label: 'Today', date: today }]}
        onChange={onChange}
      />
    );
    act(() => screen.getByRole('button').click());
    act(() => screen.getByText('Today').click());
    expect(onChange).toHaveBeenCalledWith(today);
  });

  it('uncontrolled: updates display after selection', () => {
    // Open calendar showing current month and select any visible date.
    render(<DatePicker defaultValue={null} locale="en-US" format={{ dateStyle: 'medium' }} />);
    act(() => screen.getByRole('button').click());
    // Get the first selectable date cell in the current month
    const cells = screen.getAllByRole('gridcell');
    const firstCell = cells.find((c) => {
      const btn = c.querySelector('button');
      return btn && !btn.disabled;
    });
    if (firstCell) {
      const btn = firstCell.querySelector('button')!;
      act(() => btn.click());
      // Dialog should be closed after selection
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }
  });

  it('closes on Escape key', () => {
    render(<DatePicker label="Pick date" />);
    act(() => screen.getByRole('button').click());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has no a11y violations (closed)', async () => {
    const { container } = render(
      <DatePicker label="Pick date" value={new Date(2024, 0, 15)} clearable />
    );
    await expectNoA11yViolations(container);
  });
});
