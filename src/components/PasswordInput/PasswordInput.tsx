import React, { forwardRef, useState, useCallback } from 'react';
import { PasswordInputProps } from './PasswordInput.types';
import { classNames } from '../../utils';
import { useFormField } from '../../hooks';
import styles from './PasswordInput.module.css';

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
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
      showStrengthIndicator,
      showIcon,
      hideIcon,
      value,
      defaultValue,
      onChange,
      ...rest
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const [internalValue, setInternalValue] = useState((defaultValue as string | undefined) ?? '');

    const { inputId, helperId, labelProps, inputAriaProps } = useFormField({
      id,
      label,
      helperText,
      errorMessage,
      validationState,
      required,
      disabled,
    });

    const currentValue = value !== undefined ? (value as string) : internalValue;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (value === undefined) {
          setInternalValue(e.target.value);
        }
        onChange?.(e);
      },
      [value, onChange]
    );

    const strength = showStrengthIndicator ? getPasswordStrength(currentValue) : 0;

    const activeMessage =
      validationState === 'error'
        ? errorMessage
        : validationState === 'success'
          ? successMessage
          : validationState === 'warning'
            ? warningMessage
            : helperText;

    const messageClass =
      validationState === 'error'
        ? styles.errorText
        : validationState === 'success'
          ? styles.successText
          : validationState === 'warning'
            ? styles.warningText
            : styles.helperText;

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
            type={visible ? 'text' : 'password'}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            value={value !== undefined ? value : internalValue}
            onChange={handleChange}
            className={classNames(styles.input, inputClassName, className)}
            style={inputStyle}
          />
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setVisible((v) => !v)}
            disabled={disabled}
            aria-label={visible ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {visible ? (hideIcon ?? <span>🙈</span>) : (showIcon ?? <span>👁</span>)}
          </button>
        </div>
        {showStrengthIndicator && currentValue.length > 0 && (
          <>
            <div className={classNames(styles.strengthBar, styles[`strength${strength}`])}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={styles.strengthSegment} />
              ))}
            </div>
            <span className={styles.strengthLabel}>{STRENGTH_LABELS[strength]}</span>
          </>
        )}
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

PasswordInput.displayName = 'PasswordInput'; // NOSONAR
