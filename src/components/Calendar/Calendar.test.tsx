import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Calendar } from './Calendar';
import { expectNoA11yViolations } from '../../test-utils/axe';

// Fixed "today" so snapshots are stable.
const TODAY = new Date(2024, 0, 15); // Jan 15, 2024

function renderCalendar(props: React.ComponentProps<typeof Calendar> = {}) {
  return render(<Calendar value={TODAY} {...props} />);
}

describe('Calendar', () => {
  it('renders month heading', () => {
    renderCalendar();
    expect(screen.getByText(/January 2024/i)).toBeInTheDocument();
  });

  it('marks selected date with aria-selected', () => {
    renderCalendar();
    const selected = screen.getAllByRole('gridcell', { selected: true });
    expect(selected.length).toBeGreaterThan(0);
  });

  it('calls onChange when a day is clicked', () => {
    const onChange = vi.fn();
    renderCalendar({ onChange });
    const jan20 = screen.getByLabelText(/January 20, 2024/i);
    act(() => jan20.click());
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg: Date = onChange.mock.calls[0][0];
    expect(arg.getDate()).toBe(20);
    expect(arg.getMonth()).toBe(0);
    expect(arg.getFullYear()).toBe(2024);
  });

  it('does not call onChange for disabled dates', () => {
    const onChange = vi.fn();
    renderCalendar({
      onChange,
      disabledDates: (d) => d.getDate() === 20,
    });
    const jan20Btn = screen.getByLabelText(/January 20, 2024/i);
    expect(jan20Btn).toBeDisabled();
    act(() => jan20Btn.click());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not call onChange for dates below min', () => {
    const onChange = vi.fn();
    renderCalendar({ onChange, min: new Date(2024, 0, 18) });
    const jan10Btn = screen.getByLabelText(/January 10, 2024/i);
    expect(jan10Btn).toBeDisabled();
    act(() => jan10Btn.click());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('navigates to next month on clicking › button', () => {
    renderCalendar();
    const nextBtn = screen.getByRole('button', { name: 'Next month' });
    act(() => nextBtn.click());
    expect(screen.getByText(/February 2024/i)).toBeInTheDocument();
  });

  it('navigates to previous month on clicking ‹ button', () => {
    renderCalendar();
    const prevBtn = screen.getByRole('button', { name: 'Previous month' });
    act(() => prevBtn.click());
    expect(screen.getByText(/December 2023/i)).toBeInTheDocument();
  });

  it('navigates to next year on clicking ›› button', () => {
    renderCalendar();
    const nextYearBtn = screen.getByRole('button', { name: 'Next year' });
    act(() => nextYearBtn.click());
    expect(screen.getByText(/January 2025/i)).toBeInTheDocument();
  });

  it('navigates to previous year on clicking ‹‹ button', () => {
    renderCalendar();
    const prevYearBtn = screen.getByRole('button', { name: 'Previous year' });
    act(() => prevYearBtn.click());
    expect(screen.getByText(/January 2023/i)).toBeInTheDocument();
  });

  it('keyboard ArrowRight moves focus to next day', () => {
    renderCalendar();
    const grid = screen.getByRole('grid');
    // Focus the selected cell (Jan 15)
    const jan15 = screen.getByLabelText(/January 15, 2024/i);
    act(() => jan15.focus());
    act(() => {
      fireEvent.keyDown(grid, { key: 'ArrowRight' });
    });
    expect(document.activeElement).toHaveAttribute('data-date', '2024-01-16');
  });

  it('keyboard ArrowLeft moves focus to previous day', () => {
    renderCalendar();
    const grid = screen.getByRole('grid');
    const jan15 = screen.getByLabelText(/January 15, 2024/i);
    act(() => jan15.focus());
    act(() => {
      fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    });
    expect(document.activeElement).toHaveAttribute('data-date', '2024-01-14');
  });

  it('keyboard ArrowDown moves focus one week forward', () => {
    renderCalendar();
    const grid = screen.getByRole('grid');
    const jan15 = screen.getByLabelText(/January 15, 2024/i);
    act(() => jan15.focus());
    act(() => {
      fireEvent.keyDown(grid, { key: 'ArrowDown' });
    });
    expect(document.activeElement).toHaveAttribute('data-date', '2024-01-22');
  });

  it('keyboard ArrowUp moves focus one week backward', () => {
    renderCalendar();
    const grid = screen.getByRole('grid');
    const jan15 = screen.getByLabelText(/January 15, 2024/i);
    act(() => jan15.focus());
    act(() => {
      fireEvent.keyDown(grid, { key: 'ArrowUp' });
    });
    expect(document.activeElement).toHaveAttribute('data-date', '2024-01-08');
  });

  it('keyboard PageDown moves focus to same day next month', () => {
    renderCalendar();
    const grid = screen.getByRole('grid');
    const jan15 = screen.getByLabelText(/January 15, 2024/i);
    act(() => jan15.focus());
    act(() => {
      fireEvent.keyDown(grid, { key: 'PageDown' });
    });
    // Should have navigated to February 2024
    expect(screen.getByText(/February 2024/i)).toBeInTheDocument();
  });

  it('keyboard Shift+PageDown moves focus to same day next year', () => {
    renderCalendar();
    const grid = screen.getByRole('grid');
    const jan15 = screen.getByLabelText(/January 15, 2024/i);
    act(() => jan15.focus());
    act(() => {
      fireEvent.keyDown(grid, { key: 'PageDown', shiftKey: true });
    });
    expect(screen.getByText(/January 2025/i)).toBeInTheDocument();
  });

  it('keyboard Enter selects focused date', () => {
    const onChange = vi.fn();
    renderCalendar({ onChange });
    const grid = screen.getByRole('grid');
    const jan15 = screen.getByLabelText(/January 15, 2024/i);
    act(() => jan15.focus());
    act(() => {
      fireEvent.keyDown(grid, { key: 'Enter' });
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('keyboard Home moves to start of week', () => {
    // Jan 15 2024 is Monday (day=1), so Home → Jan 14 (Sunday, weekStartsOn=0)
    renderCalendar({ weekStartsOn: 0 });
    const grid = screen.getByRole('grid');
    const jan15 = screen.getByLabelText(/January 15, 2024/i);
    act(() => jan15.focus());
    act(() => {
      fireEvent.keyDown(grid, { key: 'Home' });
    });
    // Monday - 1 day = Sunday Jan 14
    expect(document.activeElement).toHaveAttribute('data-date', '2024-01-14');
  });

  it('shows week numbers when showWeekNumbers=true', () => {
    renderCalendar({ showWeekNumbers: true });
    // "Wk" header should be present
    expect(screen.getByText('Wk')).toBeInTheDocument();
  });

  it('renders in French locale', () => {
    renderCalendar({ locale: 'fr-FR' });
    // French months start with lowercase
    expect(screen.getByText(/janvier 2024/i)).toBeInTheDocument();
  });

  it('highlights today with today class when highlightToday=true', () => {
    // Render without a selected value matching today.
    render(<Calendar highlightToday={true} />);
    const todayBtn = screen.getByLabelText(
      new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date())
    );
    expect(todayBtn.className).toMatch(/today/);
  });

  it('calls onMonthChange when navigating', () => {
    const onMonthChange = vi.fn();
    renderCalendar({ onMonthChange });
    act(() => screen.getByRole('button', { name: 'Next month' }).click());
    expect(onMonthChange).toHaveBeenCalledTimes(1);
  });

  it('respects controlled month prop', () => {
    renderCalendar({ month: new Date(2024, 5, 1) }); // June 2024
    expect(screen.getByText(/June 2024/i)).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = renderCalendar({ 'aria-label': 'Birthday' });
    await expectNoA11yViolations(container);
  });
});
