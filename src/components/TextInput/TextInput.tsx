'use client';
import React, { forwardRef } from 'react';
import { TextInputProps } from './TextInput.types';
import { classNames, getValidationMessage, getValidationMessageClass } from '../../utils';
import { useFormField } from '../../hooks';
import styles from './TextInput.module.css';

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
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
      prefixIcon,
      suffixIcon,
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
          prefixIcon ? styles.hasPrefixIcon : undefined,
          suffixIcon ? styles.hasSuffixIcon : undefined,
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
          {prefixIcon && <span className={styles.prefixIcon}>{prefixIcon}</span>}
          <input
            {...rest}
            {...inputAriaProps}
            ref={ref}
            id={inputId}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            className={classNames(styles.input, inputClassName, className)}
            style={inputStyle}
          />
          {suffixIcon && <span className={styles.suffixIcon}>{suffixIcon}</span>}
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

TextInput.displayName = 'TextInput';
