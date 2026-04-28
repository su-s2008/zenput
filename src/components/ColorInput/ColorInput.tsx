'use client';
import React, { forwardRef, useState, useCallback } from 'react';
import { ColorInputProps } from './ColorInput.types';
import { classNames, getValidationMessage, getValidationMessageClass } from '../../utils';
import { useFormField } from '../../hooks';
import styles from './ColorInput.module.css';

export const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  (
    {
      size = 'md',
      variant: _variant,
      validationState = 'default',
      label,
      helperText,
      errorMessage,
      successMessage,
      warningMessage,
      required,
      disabled,
      readOnly: _readOnly,
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
      showHexValue = true,
      value,
      defaultValue,
      onChange,
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

    const [internalColor, setInternalColor] = useState<string>(
      (defaultValue as string | undefined) ?? '#3b82f6'
    );
    const isControlled = value !== undefined;
    const currentColor = isControlled ? (value as string) : internalColor;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) {
          setInternalColor(e.target.value);
        }
        onChange?.(e);
      },
      [isControlled, onChange]
    );

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
          validationState === 'error' ? styles.error : undefined,
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
        <div className={styles.colorRow}>
          <div
            className={classNames(styles.colorSwatch, disabled ? styles.disabledSwatch : undefined)}
            style={{ backgroundColor: currentColor }}
          >
            <input
              {...rest}
              {...inputAriaProps}
              ref={ref}
              id={inputId}
              type="color"
              disabled={disabled}
              required={required}
              value={currentColor}
              onChange={handleChange}
              className={classNames(styles.input, inputClassName, className)}
              style={inputStyle}
            />
          </div>
          {showHexValue && <span className={styles.hexValue}>{currentColor.toUpperCase()}</span>}
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

ColorInput.displayName = 'ColorInput';
