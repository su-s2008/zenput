export interface CalendarProps {
  /** Currently focused/selected date. */
  value?: Date | null;
  /** Called when the user selects a date. */
  onChange?: (date: Date) => void;
  /** Minimum selectable date (inclusive). */
  min?: Date;
  /** Maximum selectable date (inclusive). */
  max?: Date;
  /** Predicate that returns true for dates that should be disabled. */
  disabledDates?: (date: Date) => boolean;
  /** Locale string passed to Intl.DateTimeFormat (e.g. 'en-US', 'fr-FR'). */
  locale?: string;
  /** Day the week starts on. 0 = Sunday, 1 = Monday, …, 6 = Saturday. Default: 0. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Show week numbers. Default: false. */
  showWeekNumbers?: boolean;
  /** Override the month/year the calendar opens on (controlled). */
  month?: Date;
  /** Called when the calendar navigates to a different month. */
  onMonthChange?: (month: Date) => void;
  /** Highlight today even when it is not the selected value. Default: true. */
  highlightToday?: boolean;
  /** Start date of a selected range (used by DateRangePicker for range highlight). */
  rangeStart?: Date | null;
  /** End date of a selected range (used by DateRangePicker for range highlight). */
  rangeEnd?: Date | null;
  /** Additional class on the root element. */
  className?: string;
  /** id for accessibility. */
  id?: string;
  /** aria-label for the grid. */
  'aria-label'?: string;
  /** aria-labelledby for the grid. */
  'aria-labelledby'?: string;
}
