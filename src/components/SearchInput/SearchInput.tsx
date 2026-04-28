'use client';
import React, { forwardRef, useState, useCallback, useRef } from 'react';
import { SearchInputProps } from './SearchInput.types';
import { classNames, getValidationMessage, getValidationMessageClass } from '../../utils';
import { useFormField } from '../../hooks';
import styles from './SearchInput.module.css';

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
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
      onSearch,
      showClearButton = true,
      showSearchIcon = true,
      value,
      defaultValue,
      onChange,
      onKeyDown,
      placeholder = 'Search…',
      ...rest
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

    const [internalValue, setInternalValue] = useState((defaultValue as string | undefined) ?? '');
    const isControlled = value !== undefined;
    const currentValue = isControlled ? (value as string) : internalValue;

    const { inputId, helperId, labelProps, inputAriaProps } = useFormField({
      id,
      label,
      helperText,
      errorMessage,
      validationState,
      required,
      disabled,
    });

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setInternalValue(e.target.value);
        onChange?.(e);
      },
      [isControlled, onChange]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          onSearch?.(currentValue);
        }
        onKeyDown?.(e);
      },
      [currentValue, onSearch, onKeyDown]
    );

    const handleClear = useCallback(() => {
      if (!isControlled) setInternalValue('');

      // Call onChange with a synthetic event if the component is controlled
      if (onChange && inputRef.current) {
        const syntheticEvent = {
          target: { ...inputRef.current, value: '' },
          currentTarget: inputRef.current,
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }

      onSearch?.('');
      inputRef.current?.focus();
    }, [isControlled, inputRef, onChange, onSearch]);

    const activeMessage = getValidationMessage(
      validationState,
      errorMessage,
      successMessage,
      warningMessage,
      helperText
    );

    const messageClass = getValidationMessageClass(validationState, styles);

    const hasClearButton = showClearButton && Boolean(currentValue);

    return (
      <div
        className={classNames(
          styles.wrapper,
          styles[size],
          styles[variant],
          validationState !== 'default' ? styles[validationState] : undefined,
          fullWidth ? styles.fullWidth : undefined,
          hasClearButton ? styles.hasClear : undefined,
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
          {showSearchIcon && <span className={styles.searchIcon}>🔍</span>}
          <input
            {...rest}
            {...inputAriaProps}
            ref={inputRef}
            id={inputId}
            type="search"
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            placeholder={placeholder}
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={classNames(styles.input, inputClassName, className)}
            style={inputStyle}
          />
          {hasClearButton && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClear}
              disabled={disabled}
              aria-label="Clear search"
              tabIndex={-1}
            >
              ✕
            </button>
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

SearchInput.displayName = 'SearchInput';
