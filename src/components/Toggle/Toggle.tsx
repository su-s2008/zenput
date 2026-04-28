'use client';
import React, { forwardRef, useState, useCallback } from 'react';
import { ToggleProps } from './Toggle.types';
import { classNames } from '../../utils';
import { useFormField } from '../../hooks';
import styles from './Toggle.module.css';

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
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
      className,
      checked,
      defaultChecked,
      onChange,
      labelPosition = 'right',
      ...rest
    },
    ref
  ) => {
    const { inputId, helperId, inputAriaProps } = useFormField({
      id,
      label,
      helperText,
      errorMessage,
      validationState,
      required,
      disabled,
    });

    const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) {
          setInternalChecked(e.target.checked);
        }
        onChange?.(e);
      },
      [isControlled, onChange]
    );

    const activeMessage = validationState === 'error' ? errorMessage : helperText;
    const messageClass = validationState === 'error' ? styles.errorText : styles.helperText;

    return (
      <div
        className={classNames(
          styles.wrapper,
          styles[size],
          isChecked ? styles.checked : undefined,
          validationState === 'error' ? styles.error : undefined,
          wrapperClassName
        )}
        style={wrapperStyle}
      >
        <label
          className={classNames(
            styles.toggleRow,
            labelPosition === 'left' ? styles.labelLeft : undefined,
            disabled ? styles.disabled : undefined
          )}
          style={labelStyle}
        >
          <input
            {...rest}
            {...inputAriaProps}
            ref={ref}
            id={inputId}
            type="checkbox"
            role="switch"
            disabled={disabled}
            required={required}
            checked={isChecked}
            onChange={handleChange}
            className={classNames(styles.nativeInput, inputClassName, className)}
            style={inputStyle}
            aria-checked={isChecked}
          />
          <span className={styles.track} aria-hidden="true">
            <span className={styles.thumb} />
          </span>
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

Toggle.displayName = 'Toggle';
