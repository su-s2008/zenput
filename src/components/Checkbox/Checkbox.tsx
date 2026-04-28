'use client';
import React, { forwardRef, useEffect, useRef } from 'react';
import { CheckboxProps } from './Checkbox.types';
import { classNames } from '../../utils';
import { useFormField } from '../../hooks';
import styles from './Checkbox.module.css';

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
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
      inputClassName,
      inputStyle,
      helperTextClassName,
      helperTextStyle,
      id,
      indeterminate,
      className,
      ...rest
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const checkboxRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

    const { inputId, helperId, inputAriaProps } = useFormField({
      id,
      label,
      helperText,
      errorMessage,
      validationState,
      required,
      disabled,
    });

    useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate, checkboxRef]);

    const activeMessage = validationState === 'error' ? errorMessage : helperText;
    const messageClass = validationState === 'error' ? styles.errorText : styles.helperText;

    return (
      <div
        className={classNames(
          styles.wrapper,
          styles[size],
          validationState === 'error' ? styles.error : undefined,
          wrapperClassName
        )}
        style={wrapperStyle}
      >
        <label
          className={classNames(styles.checkboxRow, disabled ? styles.disabled : undefined)}
          style={labelStyle}
        >
          <input
            {...rest}
            {...inputAriaProps}
            ref={checkboxRef}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            required={required}
            className={classNames(styles.input, inputClassName, className)}
            style={inputStyle}
          />
          {label && (
            <span
              className={classNames(
                styles.label,
                required ? styles.required : undefined,
                labelClassName
              )}
            >
              {label}
            </span>
          )}
        </label>
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

Checkbox.displayName = 'Checkbox';
