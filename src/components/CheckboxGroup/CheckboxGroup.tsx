'use client';
import React, { forwardRef, useId } from 'react';
import { CheckboxGroupProps } from './CheckboxGroup.types';
import { classNames } from '../../utils';
import { useControllable } from '../../hooks';
import { Checkbox } from '../Checkbox/Checkbox';
import styles from './CheckboxGroup.module.css';

export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
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
      options,
      value,
      defaultValue,
      onChange,
      direction = 'vertical',
    },
    ref
  ) => {
    const generatedId = useId();
    const groupId = id ?? `checkbox-group-${generatedId}`;
    const helperId = `${groupId}-helper`;

    const [selectedValues, setSelectedValues] = useControllable<string[]>({
      value,
      defaultValue: defaultValue ?? [],
      onChange,
    });

    const handleChange = (optionValue: string, checked: boolean) => {
      const current = selectedValues ?? [];
      const next = checked ? [...current, optionValue] : current.filter((v) => v !== optionValue);
      setSelectedValues(next);
    };

    const activeMessage = validationState === 'error' ? errorMessage : helperText;
    const messageClass = validationState === 'error' ? styles.errorText : styles.helperText;

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={label ? `${groupId}-label` : undefined}
        aria-describedby={activeMessage ? helperId : undefined}
        className={classNames(styles.wrapper, wrapperClassName)}
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
          {options.map((opt) => (
            <Checkbox
              key={opt.value}
              id={`${groupId}-${opt.value}`}
              label={opt.label}
              size={size}
              disabled={disabled || opt.disabled}
              checked={(selectedValues ?? []).includes(opt.value)}
              onChange={(e) => handleChange(opt.value, e.target.checked)}
              validationState={validationState}
            />
          ))}
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

CheckboxGroup.displayName = 'CheckboxGroup';
