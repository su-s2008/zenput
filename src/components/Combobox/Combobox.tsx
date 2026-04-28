'use client';
import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
  useId,
  useMemo,
  KeyboardEvent,
} from 'react';
import { ComboboxProps, ComboboxOption } from './Combobox.types';
import {
  classNames,
  getValidationMessage,
  getValidationMessageClass,
  DROPDOWN_BLUR_DELAY_MS,
} from '../../utils';
import { useFormField } from '../../hooks';
import styles from './Combobox.module.css';

const DEFAULT_DEBOUNCE_MS = 300;

function defaultFilter(options: ComboboxOption[], query: string): ComboboxOption[] {
  const q = query.toLowerCase();
  return options.filter((o) => o.label.toLowerCase().includes(q));
}

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
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
      options = [],
      value,
      defaultValue,
      onChange,
      filter = defaultFilter,
      loadOptions,
      emptyState,
      loadingState,
      groupBy,
      renderOption,
      placeholder,
      clearable = false,
      debounceMs = DEFAULT_DEBOUNCE_MS,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const listboxId = `cb-listbox-${generatedId}`;

    const { inputId, helperId, labelProps, inputAriaProps } = useFormField({
      id,
      label,
      helperText,
      errorMessage,
      validationState,
      required,
      disabled,
    });

    // ── Selection state ──────────────────────────────────────────────────────
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<ComboboxOption | null>(
      defaultValue ?? null
    );
    const selectedValue = isControlled ? value! : internalValue;

    // ── Input / open state ───────────────────────────────────────────────────
    const [inputValue, setInputValue] = useState(selectedValue?.label ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [asyncOptions, setAsyncOptions] = useState<ComboboxOption[]>([]);
    const [asyncLoading, setAsyncLoading] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const raceRef = useRef(0);

    // ── Sync input value when controlled value changes ────────────────────────
    useEffect(() => {
      if (isControlled) {
        setInputValue(value?.label ?? '');
      }
    }, [isControlled, value]);

    // ── Async loading ─────────────────────────────────────────────────────────
    useEffect(() => {
      if (!loadOptions) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const seq = ++raceRef.current;
        setAsyncLoading(true);
        try {
          const results = await loadOptions(inputValue);
          if (seq === raceRef.current) setAsyncOptions(results);
        } finally {
          if (seq === raceRef.current) setAsyncLoading(false);
        }
      }, debounceMs);
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }, [inputValue, loadOptions, debounceMs]);

    // ── Derived options ───────────────────────────────────────────────────────
    const baseOptions = loadOptions ? asyncOptions : options;
    const isLoading = loadOptions ? asyncLoading : false;

    const filteredOptions = useMemo(() => {
      if (loadOptions) return baseOptions;
      return filter(baseOptions, inputValue);
    }, [baseOptions, filter, inputValue, loadOptions]);

    // ── Group handling ────────────────────────────────────────────────────────
    const grouped = useMemo<Map<string, ComboboxOption[]>>(() => {
      if (!groupBy) return new Map([['', filteredOptions]]);
      const map = new Map<string, ComboboxOption[]>();
      for (const opt of filteredOptions) {
        const key = groupBy(opt);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(opt);
      }
      return map;
    }, [filteredOptions, groupBy]);

    const flatOptions = useMemo(() => {
      const flat: ComboboxOption[] = [];
      for (const opts of grouped.values()) for (const o of opts) flat.push(o);
      return flat;
    }, [grouped]);

    // O(1) lookup index for flatOptions by value (avoids O(n²) findIndex per render)
    const flatIndexByValue = useMemo(() => {
      const map = new Map<string, number>();
      flatOptions.forEach((o, i) => map.set(o.value, i));
      return map;
    }, [flatOptions]);

    const showDropdown = isOpen && !disabled && !readOnly;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const selectOption = useCallback(
      (opt: ComboboxOption) => {
        if (opt.disabled) return;
        if (!isControlled) setInternalValue(opt);
        onChange?.(opt);
        setInputValue(opt.label);
        setIsOpen(false);
        setHighlightedIndex(-1);
      },
      [isControlled, onChange]
    );

    const clearSelection = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isControlled) setInternalValue(null);
        onChange?.(null);
        setInputValue('');
        setIsOpen(false);
      },
      [isControlled, onChange]
    );

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      setIsOpen(true);
      setHighlightedIndex(-1);
      // Clear selection when user types
      if (!isControlled) setInternalValue(null);
    }, [isControlled]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown) {
          if (e.key === 'ArrowDown' || e.key === 'Enter') setIsOpen(true);
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((i) => Math.min(i + 1, flatOptions.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (highlightedIndex >= 0 && flatOptions[highlightedIndex]) {
            selectOption(flatOptions[highlightedIndex]);
          }
        } else if (e.key === 'Escape') {
          setIsOpen(false);
          setHighlightedIndex(-1);
          // Restore input to current selection label
          setInputValue(selectedValue?.label ?? '');
        }
      },
      [showDropdown, flatOptions, highlightedIndex, selectOption, selectedValue]
    );

    const handleFocus = useCallback(() => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      setIsOpen(true);
    }, []);

    const handleBlur = useCallback(() => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = setTimeout(() => {
        if (!wrapperRef.current?.contains(document.activeElement)) {
          setIsOpen(false);
          setHighlightedIndex(-1);
          // Restore input to current selection label on blur
          setInputValue(selectedValue?.label ?? '');
        }
      }, DROPDOWN_BLUR_DELAY_MS);
    }, [selectedValue]);

    // Click outside
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setInputValue(selectedValue?.label ?? '');
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [selectedValue]);

    // Cleanup
    useEffect(
      () => () => {
        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
        if (debounceRef.current) clearTimeout(debounceRef.current);
      },
      []
    );

    const activeDescendant =
      highlightedIndex >= 0 ? `${listboxId}-opt-${highlightedIndex}` : undefined;

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
        ref={wrapperRef}
        className={classNames(
          styles.wrapper,
          styles[size],
          styles[variant],
          validationState === 'default' ? undefined : styles[validationState],
          fullWidth ? styles.fullWidth : undefined,
          wrapperClassName
        )}
        style={wrapperStyle}
      >
        {label && (
          <label
            {...labelProps}
            htmlFor={inputId}
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
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeDescendant}
            autoComplete="off"
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={classNames(styles.input, inputClassName, className)}
            style={inputStyle}
          />
          <span className={styles.icons}>
            {clearable && selectedValue && !disabled && !readOnly && (
              <button
                type="button"
                className={styles.clearBtn}
                onMouseDown={clearSelection}
                aria-label="Clear"
                tabIndex={-1}
              >
                ✕
              </button>
            )}
            <span
              aria-hidden="true"
              className={classNames(
                styles.chevron,
                showDropdown ? styles.chevronOpen : undefined
              )}
            >
              ▾
            </span>
          </span>
        </div>

        {showDropdown && (
          <ul
            id={listboxId}
            role="listbox" // NOSONAR
            aria-label={label ?? 'Options'}
            className={styles.dropdown}
          >
            {(() => {
              if (isLoading) {
                return (
                  <li className={styles.loadingState} role="status" /* NOSONAR */>
                    {loadingState ?? 'Loading…'}
                  </li>
                );
              }
              if (flatOptions.length === 0) {
                return (
                  <li className={styles.emptyState}>
                    {emptyState ?? 'No options found'}
                  </li>
                );
              }
              return Array.from(grouped.entries()).map(([group, opts]) => (
                <React.Fragment key={group || '__ungrouped'}>
                  {group && (
                    <li
                      className={styles.groupHeader}
                      role="presentation" // NOSONAR
                      aria-hidden="true"
                    >
                      {group}
                    </li>
                  )}
                  {opts.map((opt) => {
                    const flatIdx = flatIndexByValue.get(opt.value) ?? -1;
                    const isSelected = selectedValue?.value === opt.value;

                    return (
                      <li
                        key={opt.value}
                        id={`${listboxId}-opt-${flatIdx}`}
                        role="option" // NOSONAR
                        aria-selected={isSelected}
                        aria-disabled={opt.disabled}
                        className={classNames(
                          styles.option,
                          flatIdx === highlightedIndex ? styles.optionHighlighted : undefined,
                          isSelected ? styles.optionSelected : undefined,
                          opt.disabled ? styles.optionDisabled : undefined
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectOption(opt);
                        }}
                        onMouseEnter={() => setHighlightedIndex(flatIdx)}
                      >
                        {renderOption ? renderOption(opt) : opt.label}
                      </li>
                    );
                  })}
                </React.Fragment>
              ));
            })()}
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

Combobox.displayName = 'Combobox';
