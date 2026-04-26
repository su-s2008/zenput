import React from 'react';
import { BaseInputProps } from '../../types';

export interface DatePreset {
  label: string;
  date: Date;
}

export interface DatePickerProps extends Omit<BaseInputProps, 'onChange'> {
  /** Controlled selected date. */
  value?: Date | null;
  /** Uncontrolled default value. */
  defaultValue?: Date | null;
  /** Called when the date changes. */
  onChange?: (date: Date | null) => void;
  /**
   * How to format the displayed date. Uses Intl.DateTimeFormat options.
   * Default: `{ dateStyle: 'medium' }`.
   */
  format?: Intl.DateTimeFormatOptions;
  /** Locale passed to Intl.DateTimeFormat and Calendar. Default: `'en-US'`. */
  locale?: string;
  /** Minimum selectable date. */
  min?: Date;
  /** Maximum selectable date. */
  max?: Date;
  /** Predicate returning true for dates that should not be selectable. */
  disabledDates?: (date: Date) => boolean;
  /** Preset shortcuts displayed above the calendar. */
  presets?: DatePreset[];
  /** Show a clear button when a date is selected. Default: false. */
  clearable?: boolean;
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Day the week starts on. 0=Sunday, 1=Monday. Default: 0. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * When true on touch devices, render the native `DateInput` instead of
   * the popover calendar. Default: false.
   */
  nativeFallback?: boolean;
  /** Disable the whole picker. */
  disabled?: boolean;
  /** Make the picker read-only. */
  readOnly?: boolean;
  /** Component size. */
  size?: 'sm' | 'md' | 'lg';
  /** Input variant. */
  variant?: 'outlined' | 'filled' | 'underlined';
  /** id for the input element. */
  id?: string;
  /** Validation state. */
  validationState?: 'default' | 'error' | 'success' | 'warning';
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
