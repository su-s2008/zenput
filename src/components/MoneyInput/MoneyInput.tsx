'use client';
import React, { useCallback, useId } from 'react';
import { MoneyInputProps } from './MoneyInput.types';
import { classNames, getValidationMessage, getValidationMessageClass } from '../../utils';
import { useControllable } from '../../hooks';
import styles from './MoneyInput.module.css';

export function MoneyInput({
  currencies,
  currency,
  defaultCurrency,
  onCurrencyChange,
  value,
  defaultValue,
  onChange,
  min,
  max,
  step = 0.01,
  placeholder,
  id,
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
  fullWidth,
  wrapperClassName,
  wrapperStyle,
  labelClassName,
  labelStyle,
  inputClassName,
  inputStyle,
  helperTextClassName,
  helperTextStyle,
}: Readonly<MoneyInputProps>) {
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const helperId = `${baseId}-helper`;
  const amountId = id ?? `${baseId}-amount`;
  const currencyId = `${baseId}-currency`;

  const [currentCurrency, setCurrentCurrency] = useControllable<string>({
    value: currency,
    defaultValue: defaultCurrency ?? currencies[0]?.code ?? '',
    onChange: onCurrencyChange,
  });

  const [currentAmount, setCurrentAmount] = useControllable<number | undefined>({
    value,
    defaultValue,
    onChange,
  });

  const handleCurrencyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrentCurrency(e.target.value);
    },
    [setCurrentCurrency]
  );

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '' || raw === '-') {
        setCurrentAmount(undefined);
        return;
      }
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        setCurrentAmount(parsed);
      }
    },
    [setCurrentAmount]
  );

  const activeMessage = getValidationMessage(
    validationState,
    errorMessage,
    successMessage,
    warningMessage,
    helperText
  );

  const messageClass = getValidationMessageClass(validationState, styles);

  const selectedCurrency = currencies.find((c) => c.code === currentCurrency);

  const ariaDescribedBy = activeMessage ? helperId : undefined;
  const ariaInvalid = validationState === 'error' ? true : undefined;

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
          id={labelId}
          htmlFor={amountId}
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
      <div
        className={classNames(
          styles.inputRow,
          disabled ? styles.disabled : undefined,
          readOnly ? styles.readOnly : undefined
        )}
      >
        {/* Currency selector */}
        <select
          id={currencyId}
          value={currentCurrency}
          disabled={disabled || readOnly}
          aria-label={label ? undefined : 'Currency'}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-readonly={readOnly || undefined}
          className={styles.currencySelect}
          onChange={handleCurrencyChange}
        >
          {currencies.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.symbol} {opt.code}
              {opt.label ? ` - ${opt.label}` : ''}
            </option>
          ))}
        </select>
        <div className={styles.divider} aria-hidden="true" />
        {/* Amount field */}
        <input
          id={amountId}
          type="number"
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder ?? (selectedCurrency ? `0.00` : undefined)}
          value={currentAmount !== undefined ? currentAmount : ''}
          onChange={handleAmountChange}
          aria-label={label ? undefined : 'Amount'}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          className={classNames(styles.amountInput, inputClassName)}
          style={inputStyle}
        />
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

MoneyInput.displayName = 'MoneyInput';
