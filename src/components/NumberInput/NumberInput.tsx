import React, { forwardRef, useCallback, useState } from 'react';
import { NumberInputProps } from './NumberInput.types';
import { classNames, getValidationMessage, getValidationMessageClass } from '../../utils';
import { useFormField } from '../../hooks';
import { useControllable } from '../../hooks';
import styles from './NumberInput.module.css';

function computeDisplayValue(
  currentValue: number | undefined,
  formatValue: ((n: number) => string) | undefined,
  isFocused: boolean
): number | string {
  if (currentValue === undefined) return '';
  if (!isFocused && formatValue !== undefined) return formatValue(currentValue);
  return currentValue;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
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
      value,
      defaultValue,
      onChange,
      min,
      max,
      step = 1,
      hideControls,
      placeholder,
      formatValue,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const { inputId, helperId, labelProps, inputAriaProps } = useFormField({
      id,
      label,
      helperText,
      errorMessage,
      validationState,
      required,
      disabled,
    });

    const [currentValue, setCurrentValue] = useControllable<number | undefined>({
      value,
      defaultValue,
      onChange,
    });

    const [isFocused, setIsFocused] = useState(false);

    const clamp = useCallback(
      (n: number) => {
        let clamped = n;
        if (min !== undefined) clamped = Math.max(min, clamped);
        if (max !== undefined) clamped = Math.min(max, clamped);
        return clamped;
      },
      [min, max]
    );

    const handleIncrement = useCallback(() => {
      const next = clamp((currentValue ?? 0) + (step ?? 1));
      setCurrentValue(next);
    }, [currentValue, step, clamp, setCurrentValue]);

    const handleDecrement = useCallback(() => {
      const next = clamp((currentValue ?? 0) - (step ?? 1));
      setCurrentValue(next);
    }, [currentValue, step, clamp, setCurrentValue]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (raw === '' || raw === '-') {
          setCurrentValue(undefined);
          return;
        }
        const parsed = parseFloat(raw);
        if (!isNaN(parsed)) {
          setCurrentValue(parsed);
        }
      },
      [setCurrentValue]
    );

    const activeMessage = getValidationMessage(
      validationState,
      errorMessage,
      successMessage,
      warningMessage,
      helperText
    );

    const messageClass = getValidationMessageClass(validationState, styles);

    const showControls = !hideControls && !readOnly;
    const isAtMin = min !== undefined && (currentValue ?? 0) <= min;
    const isAtMax = max !== undefined && (currentValue ?? 0) >= max;

    // When a formatValue function is provided, show formatted text when not focused
    const displayValue = computeDisplayValue(currentValue, formatValue, isFocused);

    return (
      <div
        className={classNames(
          styles.wrapper,
          styles[size],
          styles[variant],
          validationState !== 'default' ? styles[validationState] : undefined,
          fullWidth ? styles.fullWidth : undefined,
          showControls ? styles.hasControls : undefined,
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
            type={!isFocused && formatValue !== undefined ? 'text' : 'number'}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            value={displayValue}
            onChange={handleChange}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={classNames(styles.input, inputClassName, className)}
            style={inputStyle}
          />
          {showControls && (
            <div className={styles.controls}>
              <button
                type="button"
                className={styles.controlBtn}
                onClick={handleIncrement}
                disabled={disabled || isAtMax}
                aria-label="Increment"
                tabIndex={-1}
              >
                ▲
              </button>
              <button
                type="button"
                className={styles.controlBtn}
                onClick={handleDecrement}
                disabled={disabled || isAtMin}
                aria-label="Decrement"
                tabIndex={-1}
              >
                ▼
              </button>
            </div>
          )}
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

NumberInput.displayName = 'NumberInput';
