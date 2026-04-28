'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TimePickerProps, TimeValue } from './TimePicker.types';
import { Popover, PopoverTrigger, PopoverContent, usePopoverState } from '../overlay/Popover/Popover';
import { classNames } from '../../utils';
import { useFormField } from '../../hooks';
import inputStyles from '../DateInput/DateInput.module.css';
import styles from './TimePicker.module.css';
import { ClearButton, PickerFieldShell } from '../_pickerInternals';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatTime(
  value: TimeValue | null | undefined,
  hourCycle: 12 | 24,
  showSeconds: boolean
): string {
  if (!value) return '';
  const { hours, minutes, seconds } = value;
  if (hourCycle === 12) {
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    return showSeconds
      ? `${pad(h12)}:${pad(minutes)}:${pad(seconds ?? 0)} ${period}`
      : `${pad(h12)}:${pad(minutes)} ${period}`;
  }
  return showSeconds
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds ?? 0)}`
    : `${pad(hours)}:${pad(minutes)}`;
}

function compareTime(a: TimeValue, b: TimeValue): number {
  const toS = (t: TimeValue) => t.hours * 3600 + t.minutes * 60 + (t.seconds ?? 0);
  return toS(a) - toS(b);
}

function isTimeInRange(value: TimeValue, min?: TimeValue, max?: TimeValue): boolean {
  if (min && compareTime(value, min) < 0) return false;
  if (max && compareTime(value, max) > 0) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Column
// ---------------------------------------------------------------------------

interface ColumnItem {
  value: number;
  label: string;
  disabled?: boolean;
}

interface ColumnProps {
  label: string;
  items: ColumnItem[];
  selected: number;
  onChange: (value: number) => void;
}

function Column({ label, items, selected, onChange }: Readonly<ColumnProps>): React.ReactElement {
  const listRef = useRef<HTMLUListElement>(null);
  const ITEM_HEIGHT = 36;

  // Scroll to selected item.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const idx = items.findIndex((it) => it.value === selected);
    if (idx >= 0) {
      list.scrollTop = idx * ITEM_HEIGHT - ITEM_HEIGHT;
    }
  }, [selected, items]);

  return (
    <div className={styles.column}>
      <div className={styles.columnLabel}>{label}</div>
      <ul
        ref={listRef}
        role="listbox" // NOSONAR
        aria-label={label}
        className={styles.columnList}
        tabIndex={0}
        onKeyDown={(e) => {
          const idx = items.findIndex((it) => it.value === selected);
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            for (let i = idx + 1; i < items.length; i++) {
              if (!items[i].disabled) { onChange(items[i].value); break; }
            }
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            for (let i = idx - 1; i >= 0; i--) {
              if (!items[i].disabled) { onChange(items[i].value); break; }
            }
          }
        }}
      >
        {items.map((item) => (
          <li
            key={item.value}
            role="option" // NOSONAR
            aria-selected={item.value === selected}
            aria-disabled={item.disabled || undefined}
            className={classNames(
              styles.columnItem,
              item.value === selected ? styles.columnItemSelected : undefined,
              item.disabled ? styles.columnItemDisabled : undefined
            )}
            onClick={() => !item.disabled && onChange(item.value)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !item.disabled) {
                e.preventDefault();
                onChange(item.value);
              }
            }}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner panel (uses Popover context to close on OK)
// ---------------------------------------------------------------------------

interface TimePickerPanelProps {
  draft: TimeValue;
  period: 'AM' | 'PM';
  hourItems: ColumnItem[];
  minuteItems: ColumnItem[];
  secondItems: ColumnItem[];
  hourCycle: 12 | 24;
  showSeconds: boolean;
  selectedHour12: number;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  onSecondChange: (s: number) => void;
  onPeriodChange: (p: 'AM' | 'PM') => void;
  onConfirm: () => void;
}

function TimePickerPanel({
  draft,
  period,
  hourItems,
  minuteItems,
  secondItems,
  hourCycle,
  showSeconds,
  selectedHour12,
  onHourChange,
  onMinuteChange,
  onSecondChange,
  onPeriodChange,
  onConfirm,
}: Readonly<TimePickerPanelProps>): React.ReactElement {
  const { setOpen } = usePopoverState();

  const handleConfirm = useCallback(() => {
    onConfirm();
    setOpen(false);
  }, [onConfirm, setOpen]);

  return (
    <div className={styles.panel}>
      <div className={styles.columns}>
        <Column
          label="Hour"
          items={hourItems}
          selected={hourCycle === 12 ? selectedHour12 : draft.hours}
          onChange={onHourChange}
        />
        <div className={styles.separator}>:</div>
        <Column
          label="Minute"
          items={minuteItems}
          selected={draft.minutes}
          onChange={onMinuteChange}
        />
        {showSeconds && (
          <>
            <div className={styles.separator}>:</div>
            <Column
              label="Second"
              items={secondItems}
              selected={draft.seconds ?? 0}
              onChange={onSecondChange}
            />
          </>
        )}
        {hourCycle === 12 && (
          <div className={styles.periodColumn}>
            <div className={styles.columnLabel}>AM/PM</div>
            <button
              type="button"
              className={classNames(
                styles.periodBtn,
                period === 'AM' ? styles.periodBtnActive : undefined
              )}
              onClick={() => onPeriodChange('AM')}
            >
              AM
            </button>
            <button
              type="button"
              className={classNames(
                styles.periodBtn,
                period === 'PM' ? styles.periodBtnActive : undefined
              )}
              onClick={() => onPeriodChange('PM')}
            >
              PM
            </button>
          </div>
        )}
      </div>
      <div className={styles.footer}>
        <button type="button" className={styles.confirmBtn} onClick={handleConfirm}>
          OK
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TimePicker
// ---------------------------------------------------------------------------

export function TimePicker({
  value: controlledValue,
  defaultValue,
  onChange,
  hourCycle = 24,
  minuteStep = 1,
  secondStep = 1,
  showSeconds = false,
  min,
  max,
  locale: _locale = 'en-US',
  placeholder = 'Select time\u2026',
  clearable = false,
  disabled = false,
  readOnly = false,
  size = 'md',
  variant = 'outlined',
  label,
  helperText,
  errorMessage,
  successMessage,
  warningMessage,
  required,
  validationState = 'default',
  id,
  wrapperClassName,
  wrapperStyle,
  labelClassName,
  labelStyle,
  helperTextClassName,
  helperTextStyle,
}: TimePickerProps): React.ReactElement {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<TimeValue | null>(
    defaultValue ?? null
  );
  const value: TimeValue | null = isControlled ? (controlledValue ?? null) : internalValue;

  const [draft, setDraft] = useState<TimeValue>({ hours: 0, minutes: 0, seconds: 0 });
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  // Use a ref to access the latest value/hourCycle inside onOpenChange without
  // adding them as effect dependencies (which would trigger the effect on
  // every value change even when the picker is not opened).
  const valueRef = useRef(value);
  const hourCycleRef = useRef(hourCycle);
  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { hourCycleRef.current = hourCycle; }, [hourCycle]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen) {
      const v = valueRef.current ?? { hours: 0, minutes: 0, seconds: 0 };
      setDraft(v);
      if (hourCycleRef.current === 12) {
        setPeriod(v.hours >= 12 ? 'PM' : 'AM');
      }
    }
  }, []);

  const { inputId, helperId, labelProps, inputAriaProps } = useFormField({
    id,
    label,
    helperText,
    errorMessage,
    validationState,
    required,
    disabled,
  });

  const hourItems = useMemo(() => {
    const count = hourCycle === 12 ? 12 : 24;
    const start = hourCycle === 12 ? 1 : 0;
    return Array.from({ length: count }, (_, i) => {
      const h = start + i;
      let actualHour: number;
      if (hourCycle === 12) {
        actualHour = period === 'AM' ? h % 12 : (h % 12) + 12;
      } else {
        actualHour = h;
      }
      const test: TimeValue = { hours: actualHour, minutes: draft.minutes, seconds: draft.seconds ?? 0 };
      return {
        value: h,
        label: pad(h),
        disabled: !isTimeInRange(test, min, max),
      };
    });
  }, [hourCycle, draft.minutes, draft.seconds, min, max, period]);

  const minuteItems = useMemo(
    () =>
      Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => {
        const m = i * minuteStep;
        const test: TimeValue = { hours: draft.hours, minutes: m, seconds: draft.seconds ?? 0 };
        return {
          value: m,
          label: pad(m),
          disabled: !isTimeInRange(test, min, max),
        };
      }),
    [minuteStep, draft.hours, draft.seconds, min, max]
  );

  const secondItems = useMemo(
    () =>
      Array.from({ length: Math.ceil(60 / secondStep) }, (_, i) => {
        const s = i * secondStep;
        const test: TimeValue = { hours: draft.hours, minutes: draft.minutes, seconds: s };
        return {
          value: s,
          label: pad(s),
          disabled: !isTimeInRange(test, min, max),
        };
      }),
    [secondStep, draft.hours, draft.minutes, min, max]
  );

  const selectedHour12 = draft.hours % 12 === 0 ? 12 : draft.hours % 12;

  const handleHourChange = useCallback(
    (h: number) => {
      let actual = h;
      if (hourCycle === 12) {
        actual = period === 'AM' ? h % 12 : (h % 12) + 12;
      }
      setDraft((prev) => ({ ...prev, hours: actual }));
    },
    [hourCycle, period]
  );

  const handleMinuteChange = useCallback((m: number) => {
    setDraft((prev) => ({ ...prev, minutes: m }));
  }, []);

  const handleSecondChange = useCallback((s: number) => {
    setDraft((prev) => ({ ...prev, seconds: s }));
  }, []);

  const handlePeriodChange = useCallback((p: 'AM' | 'PM') => {
    setPeriod(p);
    setDraft((prev) => {
      const h12 = prev.hours % 12;
      return { ...prev, hours: p === 'AM' ? h12 : h12 + 12 };
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const next: TimeValue = {
      hours: draft.hours,
      minutes: draft.minutes,
      ...(showSeconds ? { seconds: draft.seconds ?? 0 } : {}),
    };
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }, [draft, showSeconds, isControlled, onChange]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) setInternalValue(null);
      onChange?.(null);
    },
    [isControlled, onChange]
  );

  const displayText = useMemo(
    () => formatTime(value, hourCycle, showSeconds),
    [value, hourCycle, showSeconds]
  );

  return (
    <PickerFieldShell
      helperId={helperId}
      label={label}
      required={required}
      validationState={validationState}
      size={size}
      variant={variant}
      helperText={helperText}
      errorMessage={errorMessage}
      successMessage={successMessage}
      warningMessage={warningMessage}
      labelProps={labelProps}
      wrapperClassName={wrapperClassName}
      wrapperStyle={wrapperStyle}
      labelClassName={labelClassName}
      labelStyle={labelStyle}
      helperTextClassName={helperTextClassName}
      helperTextStyle={helperTextStyle}
    >
      <Popover onOpenChange={handleOpenChange}>
        <div className={classNames(inputStyles.inputWrapper, styles.triggerWrap)}>
          <PopoverTrigger
            id={inputId}
            disabled={disabled || readOnly}
            {...inputAriaProps}
            className={classNames(
              inputStyles.input,
              styles.trigger,
              displayText ? undefined : styles.placeholder
            )}
          >
            <span className={styles.triggerText}>{displayText || placeholder}</span>
            <span className={styles.triggerIcons}>
              <span aria-hidden className={styles.clockIcon}>
                \uD83D\uDD50
              </span>
            </span>
          </PopoverTrigger>
          {clearable && value && !disabled && !readOnly && (
            <ClearButton
              aria-label="Clear time"
              className={styles.clearBtn}
              onClear={handleClear}
            />
          )}
        </div>

        <PopoverContent side="bottom" align="start" aria-label="Time picker">
          <TimePickerPanel
            draft={draft}
            period={period}
            hourItems={hourItems}
            minuteItems={minuteItems}
            secondItems={secondItems}
            hourCycle={hourCycle}
            showSeconds={showSeconds}
            selectedHour12={selectedHour12}
            onHourChange={handleHourChange}
            onMinuteChange={handleMinuteChange}
            onSecondChange={handleSecondChange}
            onPeriodChange={handlePeriodChange}
            onConfirm={handleConfirm}
          />
        </PopoverContent>
      </Popover>
    </PickerFieldShell>
  );
}

TimePicker.displayName = 'TimePicker';
