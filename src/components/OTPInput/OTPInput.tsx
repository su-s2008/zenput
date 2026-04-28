'use client';
import React, { forwardRef, useRef, useCallback, useId } from 'react';
import { OTPInputProps } from './OTPInput.types';
import { classNames } from '../../utils';
import { useControllable } from '../../hooks';
import styles from './OTPInput.module.css';

export const OTPInput = forwardRef<HTMLDivElement, OTPInputProps>(
  (
    {
      size = 'md',
      validationState = 'default',
      label,
      helperText,
      errorMessage,
      required,
      disabled,
      wrapperClassName,
      wrapperStyle,
      labelClassName,
      labelStyle,
      helperTextClassName,
      helperTextStyle,
      id,
      length = 6,
      value,
      defaultValue,
      onChange,
      onComplete,
      inputType = 'numeric',
      mask,
    },
    ref
  ) => {
    const generatedId = useId();
    const groupId = id ?? `otp-${generatedId}`;
    const helperId = `${groupId}-helper`;

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [internalValue, setInternalValue] = useControllable<string>({
      value,
      defaultValue: defaultValue ?? '',
      onChange,
    });

    const currentValue = internalValue ?? '';
    const digits = Array.from({ length }, (_, i) => currentValue[i] ?? '');

    const isAllowed = useCallback(
      (char: string) => {
        if (inputType === 'numeric') return /^\d$/.test(char);
        return /^[a-zA-Z0-9]$/.test(char);
      },
      [inputType]
    );

    const updateValue = useCallback(
      (newDigits: string[]) => {
        const newValue = newDigits.join('');
        setInternalValue(newValue);
        if (newValue.length === length && !newDigits.includes('')) {
          onComplete?.(newValue);
        }
      },
      [length, setInternalValue, onComplete]
    );

    const handleChange = useCallback(
      (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const char = raw.slice(-1);
        if (char && !isAllowed(char)) return;

        const newDigits = [...digits];
        newDigits[index] = char;
        updateValue(newDigits);

        if (char && index < length - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      },
      [digits, isAllowed, length, updateValue]
    );

    const handleKeyDown = useCallback(
      (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
          if (digits[index]) {
            const newDigits = [...digits];
            newDigits[index] = '';
            updateValue(newDigits);
          } else if (index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newDigits = [...digits];
            newDigits[index - 1] = '';
            updateValue(newDigits);
          }
        } else if (e.key === 'ArrowLeft' && index > 0) {
          inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      },
      [digits, length, updateValue]
    );

    const handlePaste = useCallback(
      (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').split('');
        const newDigits = [...digits];
        let filled = 0;
        for (let i = 0; i < pasted.length && filled < length; i++) {
          const char = pasted[i];
          if (isAllowed(char)) {
            const targetIdx = filled;
            newDigits[targetIdx] = char;
            filled++;
          }
        }
        updateValue(newDigits);
        const nextFocus = Math.min(filled, length - 1);
        inputRefs.current[nextFocus]?.focus();
      },
      [digits, isAllowed, length, updateValue]
    );

    const activeMessage =
      validationState === 'error'
        ? errorMessage
        : validationState === 'success'
          ? undefined
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
        ref={ref}
        className={classNames(
          styles.wrapper,
          styles[size],
          validationState !== 'default' ? styles[validationState] : undefined,
          wrapperClassName
        )}
        style={wrapperStyle}
      >
        {label && (
          <label
            htmlFor={`${groupId}-0`}
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
        <div className={styles.inputsRow} role="group" aria-label={label ?? 'One-time password'}>
          {digits.map((digit, index) => (
            <React.Fragment key={index}>
              {index === length / 2 && length > 4 && (
                <span className={styles.separator} aria-hidden="true">
                  —
                </span>
              )}
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                id={index === 0 ? `${groupId}-0` : undefined}
                type={mask ? 'password' : 'text'}
                inputMode={inputType === 'numeric' ? 'numeric' : 'text'}
                maxLength={1}
                value={digit}
                disabled={disabled}
                required={required && index === 0}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                className={classNames(styles.digitInput, digit ? styles.digitFilled : undefined)}
                aria-label={`Digit ${index + 1} of ${length}`}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
              />
            </React.Fragment>
          ))}
        </div>
        {(activeMessage || (validationState === 'error' && errorMessage)) && (
          <span
            id={helperId}
            className={classNames(messageClass, helperTextClassName)}
            style={helperTextStyle}
          >
            {validationState === 'error' ? errorMessage : activeMessage}
          </span>
        )}
      </div>
    );
  }
);

OTPInput.displayName = 'OTPInput';
