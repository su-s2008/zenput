import React, { forwardRef, useState, useCallback, useRef, useEffect, useId } from 'react';
import { AutoCompleteProps, AutoCompleteOption } from './AutoComplete.types';
import {
  classNames,
  getValidationMessage,
  getValidationMessageClass,
  DROPDOWN_BLUR_DELAY_MS,
} from '../../utils';
import { useFormField } from '../../hooks';
import styles from './AutoComplete.module.css';

export const AutoComplete = forwardRef<HTMLInputElement, AutoCompleteProps>(
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
      options,
      value,
      defaultValue,
      onChange,
      onSelect,
      onSearch,
      loading,
      noOptionsMessage = 'No options found',
      allowCustomValue,
      placeholder,
      onBlur,
      onFocus,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const listboxId = `ac-listbox-${generatedId}`;

    const { inputId, helperId, labelProps, inputAriaProps } = useFormField({
      id,
      label,
      helperText,
      errorMessage,
      validationState,
      required,
      disabled,
    });

    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [inputValue, setInputValue] = useState((defaultValue as string | undefined) ?? '');

    const isControlled = value !== undefined;
    const currentInputValue = isControlled ? (value as string) : inputValue;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const filteredOptions = options.filter((opt) =>
      opt.label.toLowerCase().includes(currentInputValue.toLowerCase())
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        if (!isControlled) setInputValue(newVal);
        onChange?.(newVal);
        onSearch?.(newVal);
        setIsOpen(true);
        setHighlightedIndex(-1);
      },
      [isControlled, onChange, onSearch]
    );

    const selectOption = useCallback(
      (option: AutoCompleteOption) => {
        if (option.disabled) return;
        if (!isControlled) setInputValue(option.label);
        onChange?.(option.label);
        onSelect?.(option);
        setIsOpen(false);
        setHighlightedIndex(-1);
      },
      [isControlled, onChange, onSelect]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            setIsOpen(true);
          }
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            selectOption(filteredOptions[highlightedIndex]);
          } else if (allowCustomValue) {
            setIsOpen(false);
          }
        } else if (e.key === 'Escape') {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      },
      [isOpen, filteredOptions, highlightedIndex, selectOption, allowCustomValue]
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsOpen(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        // Clear any existing timeout
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
        }

        blurTimeoutRef.current = setTimeout(() => {
          if (!wrapperRef.current?.contains(document.activeElement)) {
            setIsOpen(false);
          }
        }, DROPDOWN_BLUR_DELAY_MS);

        onBlur?.(e);
      },
      [onBlur]
    );

    // Cleanup blur timeout on unmount
    useEffect(() => {
      return () => {
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
        }
      };
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const activeMessage = getValidationMessage(
      validationState,
      errorMessage,
      successMessage,
      warningMessage,
      helperText
    );

    const messageClass = getValidationMessageClass(validationState, styles);

    const showDropdown = isOpen && !disabled && !readOnly;

    return (
      <div
        ref={wrapperRef}
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
            type="text"
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            placeholder={placeholder}
            value={currentInputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined
            }
            className={classNames(styles.input, inputClassName, className)}
            style={inputStyle}
          />
          <span
            className={classNames(styles.chevron, showDropdown ? styles.chevronOpen : undefined)}
            aria-hidden="true"
          >
            ▾
          </span>
        </div>
        {showDropdown && (
          <ul
            id={listboxId}
            role="listbox"
            className={styles.dropdown}
            aria-label={label ?? 'Suggestions'}
          >
            {loading ? (
              <li className={styles.loading}>Loading…</li>
            ) : filteredOptions.length === 0 ? (
              <li className={styles.noOptions}>{noOptionsMessage}</li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={option.label === currentInputValue}
                  aria-disabled={option.disabled}
                  className={classNames(
                    styles.option,
                    index === highlightedIndex ? styles.optionHighlighted : undefined,
                    option.label === currentInputValue ? styles.optionSelected : undefined,
                    option.disabled ? styles.optionDisabled : undefined
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(option);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
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

AutoComplete.displayName = 'AutoComplete';
