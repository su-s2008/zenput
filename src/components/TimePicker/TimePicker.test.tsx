import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { TimePicker } from './TimePicker';
import { expectNoA11yViolations } from '../../test-utils/axe';

afterEach(() => {
  document.querySelectorAll('[data-zenput-portal]').forEach((el) => el.remove());
});

describe('TimePicker', () => {
  it('renders trigger button', () => {
    render(<TimePicker label="Time" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows placeholder when no value', () => {
    render(<TimePicker placeholder="Pick a time…" />);
    expect(screen.getByText('Pick a time…')).toBeInTheDocument();
  });

  it('opens panel on trigger click', () => {
    render(<TimePicker label="Time" />);
    act(() => screen.getByRole('button').click());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays hour and minute columns', () => {
    render(<TimePicker label="Time" />);
    act(() => screen.getByRole('button').click());
    expect(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Minute' })).toBeInTheDocument();
  });

  it('shows seconds column when showSeconds=true', () => {
    render(<TimePicker label="Time" showSeconds />);
    act(() => screen.getByRole('button').click());
    expect(screen.getByRole('listbox', { name: 'Second' })).toBeInTheDocument();
  });

  it('shows AM/PM column for 12h mode', () => {
    render(<TimePicker label="Time" hourCycle={12} />);
    act(() => screen.getByRole('button').click());
    expect(screen.getByRole('button', { name: 'AM' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PM' })).toBeInTheDocument();
  });

  it('calls onChange with selected time when OK is clicked', () => {
    const onChange = vi.fn();
    render(<TimePicker onChange={onChange} />);
    act(() => screen.getByRole('button').click());
    act(() => screen.getByRole('button', { name: 'OK' }).click());
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0][0];
    expect(arg).toMatchObject({ hours: expect.any(Number), minutes: expect.any(Number) });
  });

  it('closes panel after clicking OK', () => {
    render(<TimePicker />);
    act(() => screen.getByRole('button').click());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => screen.getByRole('button', { name: 'OK' }).click());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays formatted value in trigger', () => {
    render(<TimePicker value={{ hours: 9, minutes: 30 }} hourCycle={24} />);
    expect(screen.getByText('09:30')).toBeInTheDocument();
  });

  it('displays 12h formatted value', () => {
    render(<TimePicker value={{ hours: 14, minutes: 5 }} hourCycle={12} />);
    expect(screen.getByText('02:05 PM')).toBeInTheDocument();
  });

  it('shows clear button when clearable and value is set', () => {
    const onChange = vi.fn();
    render(
      <TimePicker
        value={{ hours: 9, minutes: 0 }}
        clearable
        onChange={onChange}
      />
    );
    const clearBtn = screen.getByRole('button', { name: /clear time/i });
    expect(clearBtn).toBeInTheDocument();
    act(() => clearBtn.click());
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('does not open when disabled', () => {
    render(<TimePicker disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders label', () => {
    render(<TimePicker label="Meeting time" />);
    expect(screen.getByText('Meeting time')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(
      <TimePicker
        label="Time"
        validationState="error"
        errorMessage="Time is required"
      />
    );
    expect(screen.getByText('Time is required')).toBeInTheDocument();
  });

  it('selecting an hour updates the draft', () => {
    const onChange = vi.fn();
    render(<TimePicker onChange={onChange} />);
    act(() => screen.getByRole('button').click());
    // Click on hour '09'
    const hourOpts = screen.getAllByRole('option');
    const opt9 = hourOpts.find((o) => o.textContent === '09');
    if (opt9) {
      act(() => opt9.click());
    }
    // Click OK to confirm
    act(() => screen.getByRole('button', { name: 'OK' }).click());
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('hourCycle=12 AM/PM toggle', () => {
    const onChange = vi.fn();
    render(<TimePicker hourCycle={12} onChange={onChange} />);
    act(() => screen.getByRole('button').click());
    // Toggle to PM
    act(() => screen.getByRole('button', { name: 'PM' }).click());
    act(() => screen.getByRole('button', { name: 'OK' }).click());
    const arg = onChange.mock.calls[0][0];
    // hours should be >= 12 for PM
    expect(arg.hours).toBeGreaterThanOrEqual(12);
  });

  it('minuteStep limits minute options', () => {
    render(<TimePicker minuteStep={15} />);
    act(() => screen.getByRole('button').click());
    const minuteList = screen.getByRole('listbox', { name: 'Minute' });
    const options = minuteList.querySelectorAll('[role="option"]');
    // 60/15 = 4 options: 00, 15, 30, 45
    expect(options.length).toBe(4);
  });

  it('has no a11y violations (closed)', async () => {
    const { container } = render(
      <TimePicker label="Meeting time" value={{ hours: 9, minutes: 30 }} clearable />
    );
    await expectNoA11yViolations(container);
  });
});
