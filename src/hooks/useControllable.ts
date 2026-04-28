'use client';
import { useState, useCallback } from 'react';

type UseControllableOptions<T> = {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
};

export function useControllable<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableOptions<T>): [T | undefined, (newValue: T) => void] {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);

  const currentValue = isControlled ? value : internalValue;

  const handleChange = useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  return [currentValue, handleChange];
}
