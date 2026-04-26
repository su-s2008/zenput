import React from 'react';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePreset {
  label: string;
  range: DateRange;
}

export interface DateRangePickerProps {
  /** Controlled range value. */
  value?: DateRange;
  /** Uncontrolled default value. */
  defaultValue?: DateRange;
  /** Called when the range changes. */
  onChange?: (range: DateRange) => void;
  /** Minimum selectable date (inclusive). */
  min?: Date;
  /** Maximum selectable date (inclusive). */
  max?: Date;
  /** Predicate returning true for dates that should not be selectable. */
  disabledDates?: (date: Date) => boolean;
  /** Locale string for Intl.DateTimeFormat. Default: `'en-US'`. */
  locale?: string;
  /**
   * How to format the displayed dates. Uses Intl.DateTimeFormat options.
   * Default: `{ dateStyle: 'medium' }`.
   */
  format?: Intl.DateTimeFormatOptions;
  /** Preset shortcuts. */
  presets?: DateRangePreset[];
  /** Placeholder text. Default: `'Select date range…'`. */
  placeholder?: string;
  /** Day the week starts on. 0=Sunday, 1=Monday. Default: 0. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Show a clear button when a range is selected. Default: false. */
  clearable?: boolean;
  /** Disable the whole picker. */
  disabled?: boolean;
  /** Make the picker read-only. */
  readOnly?: boolean;
  /** id for the trigger button. */
  id?: string;
  /** Visible label. */
  label?: string;
  /** Helper text displayed below the input. */
  helperText?: string;
  /** Error message (shown when validationState='error'). */
  errorMessage?: string;
  /** Success message. */
  successMessage?: string;
  /** Warning message. */
  warningMessage?: string;
  /** Mark the field as required. */
  required?: boolean;
  /** Validation state. */
  validationState?: 'default' | 'error' | 'success' | 'warning';
  /** Component size. */
  size?: 'sm' | 'md' | 'lg';
  /** Input variant. */
  variant?: 'outlined' | 'filled' | 'underlined';
  /** Additional class on the wrapper. */
  wrapperClassName?: string;
  /** Inline style on the wrapper element. */
  wrapperStyle?: React.CSSProperties;
  /** Additional class on the label. */
  labelClassName?: string;
  /** Inline style on the label element. */
  labelStyle?: React.CSSProperties;
  /** Additional class on the helper/error text. */
  helperTextClassName?: string;
  /** Inline style on the helper/error text. */
  helperTextStyle?: React.CSSProperties;
}
