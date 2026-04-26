import React from 'react';

export interface TimeValue {
  hours: number;
  minutes: number;
  seconds?: number;
}

export interface TimePickerProps {
  /** Controlled time value. */
  value?: TimeValue | null;
  /** Uncontrolled default value. */
  defaultValue?: TimeValue | null;
  /** Called when the time changes. Emits `null` when cleared. */
  onChange?: (time: TimeValue | null) => void;
  /** 12-hour or 24-hour clock. Default: `24`. */
  hourCycle?: 12 | 24;
  /** Minute step (5, 10, 15, 30, etc.). Default: `1`. */
  minuteStep?: number;
  /** Second step. Default: `1`. */
  secondStep?: number;
  /** Whether to show seconds column. Default: false. */
  showSeconds?: boolean;
  /** Minimum time (inclusive). */
  min?: TimeValue;
  /** Maximum time (inclusive). */
  max?: TimeValue;
  /** Locale string for display. Default: `'en-US'`. */
  locale?: string;
  /** Placeholder text. Default: `'Select time…'`. */
  placeholder?: string;
  /** Show a clear button. Default: false. */
  clearable?: boolean;
  /** Disable the picker. */
  disabled?: boolean;
  /** Make the picker read-only. */
  readOnly?: boolean;
  /** Component size. */
  size?: 'sm' | 'md' | 'lg';
  /** Input variant. */
  variant?: 'outlined' | 'filled' | 'underlined';
  /** Visible label. */
  label?: string;
  /** Helper text. */
  helperText?: string;
  /** Error message. */
  errorMessage?: string;
  /** Success message. */
  successMessage?: string;
  /** Warning message. */
  warningMessage?: string;
  /** Mark field as required. */
  required?: boolean;
  /** Validation state. */
  validationState?: 'default' | 'error' | 'success' | 'warning';
  /** id for the trigger element. */
  id?: string;
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
