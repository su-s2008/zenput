'use client';
import React, { forwardRef, useId } from 'react';
import { RadioGroupProps } from './RadioGroup.types';
import { classNames } from '../../utils';
import { useControllable } from '../../hooks';
import styles from './RadioGroup.module.css';

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
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
      name,
      options,
      value,
      defaultValue,
      onChange,
      direction = 'vertical',
    },
    ref
  ) => {
    const generatedId = useId();
    const groupId = id ?? `radio-group-${generatedId}`;
    const helperId = `${groupId}-helper`;

    const [selectedValue, setSelectedValue] = useControllable<string | undefined>({
      value,
      defaultValue,
      onChange: onChange as ((v: string | undefined) => void) | undefined,
    });

    const handleChange = (optionValue: string) => {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
    };

    const activeMessage = validationState === 'error' ? errorMessage : helperText;
    const messageClass = validationState === 'error' ? styles.errorText : styles.helperText;

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-labelledby={label ? `${groupId}-label` : undefined}
        aria-describedby={activeMessage ? helperId : undefined}
        aria-required={required}
        className={classNames(
          styles.wrapper,
          styles[size],
          validationState === 'error' ? styles.error : undefined,
          wrapperClassName
        )}
        style={wrapperStyle}
      >
        {label && (
          <span
            id={`${groupId}-label`}
            className={classNames(
              styles.groupLabel,
              required ? styles.required : undefined,
              labelClassName
            )}
            style={labelStyle}
          >
            {label}
          </span>
        )}
        <div
          className={classNames(
            styles.optionsWrapper,
            direction === 'horizontal' ? styles.horizontal : undefined
          )}
        >
          {options.map((opt) => {
            const optId = `${groupId}-${opt.value}`;
            const isDisabled = disabled || opt.disabled;
            return (
              <label
                key={opt.value}
                htmlFor={optId}
                className={classNames(styles.radioRow, isDisabled ? styles.disabled : undefined)}
              >
                <input
                  id={optId}
                  type="radio"
                  name={name}
                  value={opt.value}
                  disabled={isDisabled}
                  checked={selectedValue === opt.value}
                  onChange={() => handleChange(opt.value)}
                  className={styles.input}
                />
                <span className={styles.radioLabel}>{opt.label}</span>
              </label>
            );
          })}
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

RadioGroup.displayName = 'RadioGroup';
