import React, { forwardRef } from 'react';
import { classNames, getValidationMessage, getValidationMessageClass } from '../../utils';
import { useFormField } from '../../hooks';
import type { BaseInputProps } from '../../types';

/**
 * Stylesheet contract shared by `DateInput`, `TimeInput`, and any future native
 * typed-input wrappers that follow the same visual structure (label + input +
 * helper/validation message). Each consuming component supplies its own CSS
 * module — keys like `wrapper`, `label`, `input`, `helperText`, `errorText`,
 * `successText`, `warningText`, `inputWrapper`, `required`, `fullWidth`, plus
 * size/variant/validationState selectors are looked up by name. Typed as a
 * plain string-keyed map to remain compatible with the project's CSS Modules
 * typing (`{ readonly [key: string]: string }`).
 */
export type NativeTypedInputStyles = Readonly<Record<string, string>>;

/**
 * Props common to all native-typed input wrappers (date, time, …).
 *
 * Extends the standard input attributes (excluding `size` and `type`, which
 * are owned by the wrapper) plus the shared `BaseInputProps` for label,
 * validation, and styling slots.
 */
export type NativeTypedInputBaseProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> &
  BaseInputProps & {
    /** Lower bound for the native input (format depends on `type`). */
    min?: string;
    /** Upper bound for the native input (format depends on `type`). */
    max?: string;
  };

interface NativeTypedInputFieldProps extends NativeTypedInputBaseProps {
  /** Native input `type` attribute (e.g. `'date'`, `'time'`). */
  type: string;
  /** CSS module supplied by the consuming wrapper component. */
  styles: NativeTypedInputStyles;
}

/**
 * Internal renderer shared by thin native-typed input wrappers like
 * `DateInput` and `TimeInput`. It owns the label/validation/helper-text
 * scaffolding and ARIA wiring (via `useFormField`) so the wrappers reduce to
 * ~5 lines of code each.
 *
 * Not exported from the public package surface — consumers should use the
 * concrete wrapper components.
 */
export const NativeTypedInputField = forwardRef<HTMLInputElement, NativeTypedInputFieldProps>(
  (props, ref) => {
    const {
      type,
      styles,
      size = 'md',
      variant = 'outlined',
      validationState = 'default',
      label,
      helperText,
      errorMessage,
      successMessage,
      warningMessage,
      required,
      disabled,
      readOnly,
      prefixIcon: _prefixIcon,
      suffixIcon: _suffixIcon,
      floatingLabel: _floatingLabel,
      fullWidth,
      wrapperClassName,
      wrapperStyle,
      labelClassName,
      labelStyle,
      inputClassName,
      inputStyle,
      helperTextClassName,
      helperTextStyle,
      id,
      className,
      min,
      max,
      ...rest
    } = props;

    const { inputId, helperId, labelProps, inputAriaProps } = useFormField({
      id,
      label,
      helperText,
      errorMessage,
      validationState,
      required,
      disabled,
    });

    const activeMessage = getValidationMessage(
      validationState,
      errorMessage,
      successMessage,
      warningMessage,
      helperText
    );

    const messageClass = getValidationMessageClass(validationState, styles);

    return (
      <div
        className={classNames(
          styles.wrapper,
          styles[size],
          styles[variant],
          validationState !== 'default' ? styles[validationState] : undefined,
          fullWidth ? styles.fullWidth : undefined,
          wrapperClassName
        )}
        style={wrapperStyle}
      >
        {label && (
          <label
            {...labelProps}
            className={classNames(
              styles.label,
              required ? styles.required : undefined,
              labelClassName
            )}
            style={labelStyle}
          >
            {label}
          </label>
        )}
        <div className={styles.inputWrapper}>
          <input
            {...rest}
            {...inputAriaProps}
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            min={min}
            max={max}
            className={classNames(styles.input, inputClassName, className)}
            style={inputStyle}
          />
        </div>
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
);

NativeTypedInputField.displayName = 'NativeTypedInputField';
