import React, { forwardRef, useCallback, useState } from 'react';
import { SelectInputProps } from './SelectInput.types';
import { classNames, getValidationMessage, getValidationMessageClass } from '../../utils';
import { useFormField } from '../../hooks';
import styles from './SelectInput.module.css';

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
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
      options,
      placeholder,
      multiple,
      multiplePlaceholder = 'Add…',
      selectedValues,
      onSelectedValuesChange,
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

    const activeMessage = getValidationMessage(
      validationState,
      errorMessage,
      successMessage,
      warningMessage,
      helperText
    );

    const messageClass = getValidationMessageClass(validationState, styles);

    // ── Multi-select state ───────────────────────────────────────────────────

    const isControlled = selectedValues !== undefined;
    const [internalSelected, setInternalSelected] = useState<string[]>([]);
    const activeSelected = isControlled ? selectedValues : internalSelected;

    const handleMultiChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        const picked = e.target.value;
        if (!picked) return;
        const next = activeSelected.includes(picked) ? activeSelected : [...activeSelected, picked];
        if (!isControlled) setInternalSelected(next);
        onSelectedValuesChange?.(next);
        onChange?.(e);
        // Reset the native select back to the placeholder so it stays visually neutral
        e.target.value = '';
      },
      [activeSelected, isControlled, onSelectedValuesChange, onChange]
    );

    const removeChip = useCallback(
      (value: string) => {
        const next = activeSelected.filter((v) => v !== value);
        if (!isControlled) setInternalSelected(next);
        onSelectedValuesChange?.(next);
      },
      [activeSelected, isControlled, onSelectedValuesChange]
    );

    const getLabel = (value: string) => options.find((o) => o.value === value)?.label ?? value;

    // ── Render ────────────────────────────────────────────────────────────────

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

        {/* Chips for multi-select */}
        {multiple && activeSelected.length > 0 && (
          <div className={styles.chipList}>
            {activeSelected.map((val) => (
              <span key={val} className={styles.chip}>
                {getLabel(val)}
                <button
                  type="button"
                  aria-label={`Remove ${getLabel(val)}`}
                  className={styles.chipRemove}
                  disabled={disabled}
                  onClick={() => removeChip(val)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className={styles.inputWrapper}>
          <select
            {...rest}
            {...inputAriaProps}
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={multiple ? false : required}
            className={classNames(styles.input, inputClassName, className)}
            style={inputStyle}
            onChange={multiple ? handleMultiChange : onChange}
          >
            {(placeholder || multiple) && (
              <option value="" disabled={!multiple} className={styles.placeholderOption}>
                {placeholder ?? (multiple ? multiplePlaceholder : undefined)}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled || (multiple && activeSelected.includes(opt.value))}
              >
                {opt.label}
              </option>
            ))}
          </select>
          <span className={styles.arrow}>▾</span>
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

SelectInput.displayName = 'SelectInput';
