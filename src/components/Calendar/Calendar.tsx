/* ---------------------------------------------------------------------------
 * Calendar – popover-based, WAI-ARIA grid-pattern date picker surface.
 * Keyboard: ArrowKeys, PageUp/Down (month), Shift+PageUp/Down (year),
 *           Home/End (week), Enter/Space (select).
 * --------------------------------------------------------------------------- */
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CalendarProps } from './Calendar.types';
import { classNames } from '../../utils';
import { toLocalDateStr } from '../_pickerInternals';
import styles from './Calendar.module.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

function addMonths(d: Date, n: number): Date {
  const result = new Date(d);
  result.setMonth(result.getMonth() + n);
  return result;
}

function addYears(d: Date, n: number): Date {
  const result = new Date(d);
  result.setFullYear(result.getFullYear() + n);
  return result;
}

/** Return an ISO week number (1-53). */
function getISOWeek(d: Date): number {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp.valueOf() - yearStart.valueOf()) / 86_400_000 + 1) / 7);
}

/** Build the 6×7 (or 5×7) grid for a given month. */
function buildGrid(month: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6): Date[][] {
  const first = startOfMonth(month);
  const last = endOfMonth(month);

  // Offset so the grid starts on weekStartsOn.
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const start = addDays(first, -offset);

  const weeks: Date[][] = [];
  let current = start;
  while (current <= last || weeks.length < 6) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current = addDays(current, 1);
    }
    weeks.push(week);
    // Don't add more than 6 weeks to avoid infinite loops.
    if (weeks.length >= 6) break;
  }
  return weeks;
}

/** Short weekday labels in locale order. */
function buildWeekdays(
  locale: string,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
): string[] {
  // Use a known Sunday-starting reference date (2000-01-02 was a Sunday).
  const labels: string[] = [];
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  for (let i = 0; i < 7; i++) {
    const day = (weekStartsOn + i) % 7;
    // 2000-01-02 is Sunday (0). So day 0 → 2, day 1 → 3, etc.
    labels.push(fmt.format(new Date(2000, 0, 2 + day)));
  }
  return labels;
}

function formatMonthYear(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

function isDateDisabled(
  date: Date,
  min?: Date,
  max?: Date,
  disabledDates?: (d: Date) => boolean
): boolean {
  if (min && date < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return true;
  if (max && date > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return true;
  if (disabledDates?.(date)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  {
    value,
    onChange,
    min,
    max,
    disabledDates,
    locale = 'en-US',
    weekStartsOn = 0,
    showWeekNumbers = false,
    month: controlledMonth,
    onMonthChange,
    highlightToday = true,
    rangeStart,
    rangeEnd,
    className,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
  },
  ref
) {
  // Capture the initial month once on mount; updates via setInternalMonth.
  const defaultMonthRef = useRef<Date>(value ?? new Date());
  const [internalMonth, setInternalMonth] = useState<Date>(defaultMonthRef.current);

  const displayMonth = controlledMonth ?? internalMonth;

  const setDisplayMonth = useCallback(
    (next: Date) => {
      if (controlledMonth === undefined) {
        setInternalMonth(next);
      }
      onMonthChange?.(next);
    },
    [controlledMonth, onMonthChange]
  );

  // Keep internal month in sync when value changes externally.
  useEffect(() => {
    if (value) {
      const nm = new Date(value.getFullYear(), value.getMonth(), 1);
      setInternalMonth(nm);
    }
  }, [value]);

  const [focusedDate, setFocusedDate] = useState<Date>(value ?? new Date());
  const gridRef = useRef<HTMLTableElement>(null);
  const titleId = useId();

  const grid = useMemo(
    () => buildGrid(displayMonth, weekStartsOn),
    [displayMonth, weekStartsOn]
  );

  const weekdays = useMemo(
    () => buildWeekdays(locale, weekStartsOn),
    [locale, weekStartsOn]
  );

  const navMonth = useCallback(
    (delta: number) => {
      setDisplayMonth(addMonths(displayMonth, delta));
    },
    [displayMonth, setDisplayMonth]
  );

  const navYear = useCallback(
    (delta: number) => {
      setDisplayMonth(addYears(displayMonth, delta));
    },
    [displayMonth, setDisplayMonth]
  );

  const handleSelect = useCallback(
    (date: Date) => {
      if (isDateDisabled(date, min, max, disabledDates)) return;
      onChange?.(date);
    },
    [onChange, min, max, disabledDates]
  );

  const handleCellClick = useCallback(
    (date: Date, isCurrentMonth: boolean) => {
      setFocusedDate(date);
      if (!isCurrentMonth) {
        setDisplayMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      }
      handleSelect(date);
    },
    [handleSelect, setDisplayMonth]
  );

  // Keyboard navigation on the grid.
  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTableElement>) => {
      let next: Date | null = null;

      switch (e.key) {
        case 'ArrowRight':
          next = addDays(focusedDate, 1);
          break;
        case 'ArrowLeft':
          next = addDays(focusedDate, -1);
          break;
        case 'ArrowDown':
          next = addDays(focusedDate, 7);
          break;
        case 'ArrowUp':
          next = addDays(focusedDate, -7);
          break;
        case 'PageDown':
          next = e.shiftKey ? addYears(focusedDate, 1) : addMonths(focusedDate, 1);
          break;
        case 'PageUp':
          next = e.shiftKey ? addYears(focusedDate, -1) : addMonths(focusedDate, -1);
          break;
        case 'Home': {
          // Move to first day of week.
          const dayOfWeek = (focusedDate.getDay() - weekStartsOn + 7) % 7;
          next = addDays(focusedDate, -dayOfWeek);
          break;
        }
        case 'End': {
          // Move to last day of week.
          const dayOfWeek2 = (focusedDate.getDay() - weekStartsOn + 7) % 7;
          next = addDays(focusedDate, 6 - dayOfWeek2);
          break;
        }
        case 'Enter':
        case ' ':
          handleSelect(focusedDate);
          e.preventDefault();
          return;
        default:
          return;
      }

      if (next) {
        e.preventDefault();
        // Navigate to next month if needed.
        const nextMonth = new Date(next.getFullYear(), next.getMonth(), 1);
        const currentMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
        if (nextMonth.getTime() !== currentMonth.getTime()) {
          setDisplayMonth(nextMonth);
        }
        setFocusedDate(next);
      }
    },
    [focusedDate, weekStartsOn, handleSelect, displayMonth, setDisplayMonth]
  );

  // When focusedDate changes, focus the corresponding cell.
  useEffect(() => {
    if (!gridRef.current) return;
    const cell = gridRef.current.querySelector<HTMLElement>(
      `[data-date="${toLocalDateStr(focusedDate)}"]`
    );
    if (cell) {
      cell.focus();
    }
  }, [focusedDate]);

  const prevMonthDisabled =
    min !== undefined &&
    new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 0) <
      new Date(min.getFullYear(), min.getMonth(), min.getDate());

  const nextMonthDisabled =
    max !== undefined &&
    new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1) >
      new Date(max.getFullYear(), max.getMonth(), max.getDate());

  const prevYearDisabled =
    min !== undefined &&
    new Date(displayMonth.getFullYear() - 1, displayMonth.getMonth() + 1, 0) <
      new Date(min.getFullYear(), min.getMonth(), min.getDate());

  const nextYearDisabled =
    max !== undefined &&
    new Date(displayMonth.getFullYear() + 1, displayMonth.getMonth(), 1) >
      new Date(max.getFullYear(), max.getMonth(), max.getDate());

  return (
    <div
      ref={ref}
      id={id}
      className={classNames(styles.root, className)}
      data-calendar
    >
      {/* Header: month/year + navigation */}
      <div className={styles.header}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => navYear(-1)}
          aria-label="Previous year"
          disabled={prevYearDisabled}
        >
          ‹‹
        </button>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => navMonth(-1)}
          aria-label="Previous month"
          disabled={prevMonthDisabled}
        >
          ‹
        </button>
        <span id={titleId} className={styles.title} aria-live="polite" aria-atomic>
          {formatMonthYear(displayMonth, locale)}
        </span>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => navMonth(1)}
          aria-label="Next month"
          disabled={nextMonthDisabled}
        >
          ›
        </button>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => navYear(1)}
          aria-label="Next year"
          disabled={nextYearDisabled}
        >
          ››
        </button>
      </div>

      {/* Grid */}
      <table
        ref={gridRef}
        role="grid"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : (ariaLabelledby ?? titleId)}
        className={styles.grid}
        onKeyDown={handleGridKeyDown}
      >
        <thead>
          <tr>
            {showWeekNumbers && (
              <th scope="col" className={styles.weekNumHeader} aria-label="Week">
                Wk
              </th>
            )}
            {weekdays.map((wd) => (
              <th key={wd} scope="col" className={styles.weekday} abbr={wd}>
                {wd}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((week, wi) => {
            const weekNum = showWeekNumbers ? getISOWeek(week[0]) : null;
            return (
              <tr key={wi}>
                {showWeekNumbers && (
                  <td className={styles.weekNum} aria-label={`Week ${weekNum}`}>
                    {weekNum}
                  </td>
                )}
                {week.map((date) => {
                  const isCurrentMonth = date.getMonth() === displayMonth.getMonth();
                  const isSelected = !!value && isSameDay(date, value);
                  const isTodayDate = highlightToday && isToday(date);
                  const disabled = isDateDisabled(date, min, max, disabledDates);
                  const isFocused = isSameDay(date, focusedDate);
                  const dateStr = toLocalDateStr(date);

                  // Range highlighting (used by DateRangePicker).
                  const isRangeStart = !!rangeStart && isSameDay(date, rangeStart);
                  const isRangeEnd = !!rangeEnd && isSameDay(date, rangeEnd);
                  const isInRange =
                    !!rangeStart && !!rangeEnd && date > rangeStart && date < rangeEnd;

                  return (
                    <td
                      key={dateStr}
                      role="gridcell"
                      aria-selected={isSelected}
                      aria-disabled={disabled || undefined}
                    >
                      <button
                        type="button"
                        data-date={dateStr}
                        tabIndex={isFocused ? 0 : -1}
                        disabled={disabled}
                        aria-label={new Intl.DateTimeFormat(locale, {
                          dateStyle: 'full',
                        } as Intl.DateTimeFormatOptions).format(date)}
                        className={classNames(
                          styles.cell,
                          !isCurrentMonth && styles.outsideMonth,
                          isSelected && styles.selected,
                          isTodayDate && !isSelected && styles.today,
                          disabled && styles.disabled,
                          isInRange && styles.rangeMiddle,
                          isRangeStart && styles.rangeStart,
                          isRangeEnd && styles.rangeEnd
                        )}
                        onClick={() => handleCellClick(date, isCurrentMonth)}
                        onFocus={() => setFocusedDate(date)}
                      >
                        {date.getDate()}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

Calendar.displayName = 'Calendar';
