/* ---------------------------------------------------------------------------
 * Shared internals for the popover-based pickers (DatePicker,
 * DateRangePicker, TimePicker). Not part of the public API.
 * --------------------------------------------------------------------------- */
import React from 'react';
import { classNames } from '../../utils';
import inputStyles from '../DateInput/DateInput.module.css';

export type ValidationState = 'default' | 'error' | 'success' | 'warning';

/** Format a Date as a timezone-stable local YYYY-MM-DD string. */
export function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Pick the active validation message + its CSS class based on
 * `validationState`. Falls back to helperText / helperText style when state is
 * `default`.
 */
export function getValidationMessage(
  validationState: ValidationState,
  helperText?: React.ReactNode,
  errorMessage?: React.ReactNode,
  successMessage?: React.ReactNode,
  warningMessage?: React.ReactNode
): { activeMessage: React.ReactNode | undefined; messageClass: string } {
  switch (validationState) {
    case 'error':
      return { activeMessage: errorMessage, messageClass: inputStyles.errorText };
    case 'success':
      return { activeMessage: successMessage, messageClass: inputStyles.successText };
    case 'warning':
      return { activeMessage: warningMessage, messageClass: inputStyles.warningText };
    default:
      return { activeMessage: helperText, messageClass: inputStyles.helperText };
  }
}

export interface ClearButtonProps {
  /** Accessible label for the button. */
  'aria-label': string;
  /** CSS class (typically the picker-local `styles.clearBtn`). */
  className?: string;
  /** Click handler — receives the original mouse event. */
  onClear: (e: React.MouseEvent) => void;
}

/**
 * Sibling-of-PopoverTrigger clear button. Stops propagation so it never
 * toggles the popover, and prevents focus stealing from the trigger via
 * `onMouseDown`.
 */
export function ClearButton({
  'aria-label': ariaLabel,
  className,
  onClear,
}: ClearButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={className}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClear(e);
      }}
    >
      {'\u2715'}
    </button>
  );
}

export interface PickerFieldShellProps {
  /** Generated id from useFormField for the helper text (aria-describedby target). */
  helperId?: string;
  label?: React.ReactNode;
  required?: boolean;
  validationState?: ValidationState;
  size: 'sm' | 'md' | 'lg';
  variant: 'outlined' | 'filled' | 'underlined' | 'borderless';
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  successMessage?: React.ReactNode;
  warningMessage?: React.ReactNode;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  labelClassName?: string;
  labelStyle?: React.CSSProperties;
  helperTextClassName?: string;
  helperTextStyle?: React.CSSProperties;
  /** The trigger + popover JSX. */
  children: React.ReactNode;
}

/**
 * Wrapper that renders the standard label + content + helper-text scaffold
 * shared by all pickers.
 */
export function PickerFieldShell({
  helperId,
  label,
  required,
  validationState = 'default',
  size,
  variant,
  helperText,
  errorMessage,
  successMessage,
  warningMessage,
  labelProps,
  wrapperClassName,
  wrapperStyle,
  labelClassName,
  labelStyle,
  helperTextClassName,
  helperTextStyle,
  children,
}: PickerFieldShellProps): React.ReactElement {
  const { activeMessage, messageClass } = getValidationMessage(
    validationState,
    helperText,
    errorMessage,
    successMessage,
    warningMessage
  );

  return (
    <div
      className={classNames(
        inputStyles.wrapper,
        inputStyles[size],
        inputStyles[variant],
        validationState !== 'default' ? inputStyles[validationState] : undefined,
        wrapperClassName
      )}
      style={wrapperStyle}
    >
      {label && (
        <label
          {...labelProps}
          className={classNames(
            inputStyles.label,
            required ? inputStyles.required : undefined,
            labelClassName
          )}
          style={labelStyle}
        >
          {label}
        </label>
      )}
      {children}
      {activeMessage && (
        <span
          id={helperId}
          className={classNames(messageClass, helperTextClassName)}
          style={helperTextStyle}
        >
          {activeMessage}
        </span>
      )}
    </div>
  );
}
