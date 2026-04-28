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
import { MultiSelectProps, MultiSelectOption } from './MultiSelect.types';
import {
  classNames,
  getValidationMessage,
  getValidationMessageClass,
  DROPDOWN_BLUR_DELAY_MS,
} from '../../utils';
import { useFormField } from '../../hooks';
import styles from './MultiSelect.module.css';

const DEFAULT_DEBOUNCE_MS = 300;

let _creatableCounter = 0;
function nextCreatableId() {
  return `custom-${++_creatableCounter}`;
}

function defaultIsValidNewOption(inputValue: string, selected: MultiSelectOption[]) {
  const trimmed = inputValue.trim();
  return trimmed.length > 0 && !selected.some((s) => s.label === trimmed);
}

export const MultiSelect = forwardRef<HTMLInputElement, MultiSelectProps>(
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
      inputClassName: _inputClassName,
      inputStyle: _inputStyle,
      helperTextClassName,
      helperTextStyle,
      id,
      options = [],
      loadOptions,
      value,
      defaultValue,
      onChange,
      groupBy,
      renderOption,
      renderTag,
      creatable = false,
      isValidNewOption = defaultIsValidNewOption,
      formatCreateLabel,
      maxTags,
      searchable = true,
      clearable = false,
      placeholder = 'Select…',
      noOptionsMessage = 'No options found',
      loading: loadingProp = false,
      debounceMs = DEFAULT_DEBOUNCE_MS,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const listboxId = `ms-listbox-${generatedId}`;

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
    const [internalSelected, setInternalSelected] = useState<MultiSelectOption[]>(
      defaultValue ?? []
    );
    // In controlled mode use the value prop; in uncontrolled mode use internal state.
    // Keep these separate so that a change to internalSelected doesn't cause an
    // unnecessary recompute when the component is in controlled mode.
    const controlledValues = useMemo(() => value ?? [], [value]);
    const selectedValues = isControlled ? controlledValues : internalSelected;

    const updateSelected = useCallback(
      (next: MultiSelectOption[]) => {
        if (!isControlled) setInternalSelected(next);
        onChange?.(next);
      },
      [isControlled, onChange]
    );

    // ── Search / async state ─────────────────────────────────────────────────
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [asyncOptions, setAsyncOptions] = useState<MultiSelectOption[]>([]);
    const [asyncLoading, setAsyncLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const raceRef = useRef(0);

    // Merge external ref
    const handleRef = useCallback(
      (node: HTMLInputElement | null) => {
        (inputRef as React.RefObject<HTMLInputElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = node;
      },
      [ref]
    );

    // ── Async loading ────────────────────────────────────────────────────────
    useEffect(() => {
      if (!loadOptions) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const seq = ++raceRef.current;
        setAsyncLoading(true);
        try {
          const results = await loadOptions(query);
          if (seq === raceRef.current) {
            setAsyncOptions(results);
          }
        } finally {
          if (seq === raceRef.current) setAsyncLoading(false);
        }
      }, debounceMs);
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }, [query, loadOptions, debounceMs]);

    // ── Derived options ──────────────────────────────────────────────────────
    const baseOptions = loadOptions ? asyncOptions : options;
    const isLoading = loadOptions ? asyncLoading : loadingProp;

    const filteredOptions = useMemo(() => {
      if (loadOptions) return baseOptions;
      if (!query) return baseOptions;
      return baseOptions.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
    }, [baseOptions, query, loadOptions]);

    const allVisible = useMemo<Array<MultiSelectOption & { _isCreate?: boolean }>>(() => {
      const canCreate =
        creatable &&
        query.trim().length > 0 &&
        isValidNewOption(query, selectedValues) &&
        !filteredOptions.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());
      return canCreate
        ? [
            ...filteredOptions,
            { value: `__create__${query}`, label: query, _isCreate: true },
          ]
        : filteredOptions;
    }, [creatable, query, isValidNewOption, selectedValues, filteredOptions]);

    // ── Group handling ───────────────────────────────────────────────────────
    const grouped = useMemo<Map<string, MultiSelectOption[]>>(() => {
      if (!groupBy) return new Map([['', allVisible as MultiSelectOption[]]]);
      const map = new Map<string, MultiSelectOption[]>();
      for (const opt of allVisible as MultiSelectOption[]) {
        const key = (opt as { _isCreate?: boolean })._isCreate ? '' : groupBy(opt);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(opt);
      }
      return map;
    }, [allVisible, groupBy]);

    // Flatten for keyboard navigation (preserving visual order)
    const flatOptions = useMemo(() => {
      const flat: Array<MultiSelectOption & { _isCreate?: boolean }> = [];
      for (const opts of grouped.values()) {
        for (const o of opts) flat.push(o as MultiSelectOption & { _isCreate?: boolean });
      }
      return flat;
    }, [grouped]);

    // O(1) lookup index for flatOptions by value (avoids O(n²) findIndex per render)
    const flatIndexByValue = useMemo(() => {
      const map = new Map<string, number>();
      flatOptions.forEach((o, i) => map.set(o.value, i));
      return map;
    }, [flatOptions]);

    const showDropdown = isOpen && !disabled && !readOnly;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const openDropdown = useCallback(() => {
      setIsOpen(true);
      setHighlightedIndex(-1);
    }, []);

    const closeDropdown = useCallback(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, []);

    const selectOption = useCallback(
      (opt: MultiSelectOption & { _isCreate?: boolean }) => {
        if (opt.disabled) return;

        if (opt._isCreate) {
          const newOpt: MultiSelectOption = { value: nextCreatableId(), label: opt.label };
          if (maxTags && selectedValues.length >= maxTags) return;
          updateSelected([...selectedValues, newOpt]);
          setQuery('');
          return;
        }

        const already = selectedValues.some((s) => s.value === opt.value);
        if (already) {
          updateSelected(selectedValues.filter((s) => s.value !== opt.value));
        } else {
          if (maxTags && selectedValues.length >= maxTags) return;
          updateSelected([...selectedValues, opt]);
        }
        setQuery('');
        inputRef.current?.focus();
      },
      [selectedValues, updateSelected, maxTags]
    );

    const removeTag = useCallback(
      (optValue: string) => {
        updateSelected(selectedValues.filter((s) => s.value !== optValue));
        inputRef.current?.focus();
      },
      [selectedValues, updateSelected]
    );

    const clearAll = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        updateSelected([]);
        setQuery('');
        inputRef.current?.focus();
      },
      [updateSelected]
    );

    const handleControlClick = useCallback(() => {
      if (disabled || readOnly) return;
      inputRef.current?.focus();
      openDropdown();
    }, [disabled, readOnly, openDropdown]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setIsOpen(true);
        setHighlightedIndex(-1);
      },
      []
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && query === '' && selectedValues.length > 0) {
          e.preventDefault();
          removeTag(selectedValues[selectedValues.length - 1].value);
          return;
        }

        if (!showDropdown) {
          if (e.key === 'ArrowDown' || e.key === 'Enter') openDropdown();
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
          closeDropdown();
        }
      },
      [
        query,
        selectedValues,
        removeTag,
        showDropdown,
        flatOptions,
        highlightedIndex,
        selectOption,
        openDropdown,
        closeDropdown,
      ]
    );

    const handleFocus = useCallback(() => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      setIsFocused(true);
      openDropdown();
    }, [openDropdown]);

    const handleBlur = useCallback(() => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = setTimeout(() => {
        if (!wrapperRef.current?.contains(document.activeElement)) {
          setIsFocused(false);
          closeDropdown();
        }
      }, DROPDOWN_BLUR_DELAY_MS);
    }, [closeDropdown]);

    // Click outside
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          closeDropdown();
          setIsFocused(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [closeDropdown]);

    // Cleanup timeouts
    useEffect(
      () => () => {
        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
        if (debounceRef.current) clearTimeout(debounceRef.current);
      },
      []
    );

    // ── Active descendant ID ─────────────────────────────────────────────────
    const activeDescendant =
      highlightedIndex >= 0 ? `${listboxId}-opt-${highlightedIndex}` : undefined;

    // ── Validation message ────────────────────────────────────────────────────
    const activeMessage = getValidationMessage(
      validationState,
      errorMessage,
      successMessage,
      warningMessage,
      helperText
    );
    const messageClass = getValidationMessageClass(validationState, styles);

    // ── Render ───────────────────────────────────────────────────────────────
    return (
      <div
        ref={wrapperRef}
        className={classNames(
          styles.wrapper,
          styles[size],
          styles[variant],
          validationState === 'default' ? undefined : styles[validationState],
          isFocused ? styles.focused : undefined,
          disabled ? styles.disabled : undefined,
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

        {/* Control – chips + search input */}
        <div
          className={styles.control}
          onClick={handleControlClick}
          role="none"
        >
          {selectedValues.map((opt) =>
            renderTag ? (
              <React.Fragment key={opt.value}>
                {renderTag(opt, () => removeTag(opt.value))}
              </React.Fragment>
            ) : (
              <span key={opt.value} className={styles.tag}>
                <span className={styles.tagLabel}>{opt.label}</span>
                {!disabled && !readOnly && (
                  <button
                    type="button"
                    className={styles.tagRemove}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(opt.value);
                    }}
                    aria-label={`Remove ${opt.label}`}
                    tabIndex={-1}
                  >
                    ×
                  </button>
                )}
              </span>
            )
          )}

          <input
            {...rest}
            {...inputAriaProps}
            ref={handleRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeDescendant}
            autoComplete="off"
            disabled={disabled}
            readOnly={!searchable || readOnly}
            required={required && selectedValues.length === 0}
            placeholder={selectedValues.length === 0 ? placeholder : undefined}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={styles.searchInput}
          />

          <span className={styles.icons}>
            {clearable && selectedValues.length > 0 && !disabled && !readOnly && (
              <button
                type="button"
                className={styles.clearBtn}
                onMouseDown={clearAll}
                aria-label="Clear all"
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

        {/* Dropdown */}
        {showDropdown && (
          <ul
            id={listboxId}
            role="listbox" // NOSONAR
            aria-multiselectable="true"
            aria-label={label ?? 'Options'}
            className={styles.dropdown}
          >
            {(() => {
              if (isLoading) {
                // NOSONAR
                return <li className={styles.loading} role="status">Loading…</li>;
              }
              if (flatOptions.length === 0) {
                return <li className={styles.noOptions}>{noOptionsMessage}</li>;
              }
              return Array.from(grouped.entries()).map(([group, opts]) => (
                <React.Fragment key={group || '__ungrouped'}>
                  {group && <li className={styles.groupHeader} role="presentation" aria-hidden="true">{group}</li>} {/* NOSONAR */}
                  {opts.map((opt) => {
                    const flatIdx = flatIndexByValue.get(opt.value) ?? -1;
                    const isSelected = selectedValues.some((s) => s.value === opt.value);
                    const isCreate = (opt as MultiSelectOption & { _isCreate?: boolean })._isCreate;

                    let optionLabel: React.ReactNode;
                    if (isCreate) {
                      optionLabel = formatCreateLabel ? formatCreateLabel(opt.label) : `Create "${opt.label}"`;
                    } else if (renderOption) {
                      optionLabel = renderOption(opt);
                    } else {
                      optionLabel = opt.label;
                    }

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
                          opt.disabled ? styles.optionDisabled : undefined,
                          isCreate ? styles.creatableOption : undefined
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectOption(opt as MultiSelectOption & { _isCreate?: boolean });
                        }}
                        onMouseEnter={() => setHighlightedIndex(flatIdx)}
                      >
                        {optionLabel}
                        {isSelected && !isCreate && (
                          <span className={styles.optionCheck} aria-hidden="true">✓</span>
                        )}
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

MultiSelect.displayName = 'MultiSelect';
