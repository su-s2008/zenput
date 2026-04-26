import React from 'react';
import { BaseInputProps } from '../../types';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Group key – used when groupBy is provided */
  [key: string]: unknown;
}

export interface ComboboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'size' | 'onChange' | 'defaultValue' | 'value' | 'children' | 'dangerouslySetInnerHTML'
  >,
    BaseInputProps {
  /** Static list of options */
  options?: ComboboxOption[];
  /** Currently selected value (controlled) */
  value?: ComboboxOption | null;
  /** Default selected value (uncontrolled) */
  defaultValue?: ComboboxOption | null;
  /** Called when selection changes */
  onChange?: (option: ComboboxOption | null) => void;
  /** Override the default filter function */
  filter?: (options: ComboboxOption[], query: string) => ComboboxOption[];
  /** Async function to load options based on search query */
  loadOptions?: (query: string) => Promise<ComboboxOption[]>;
  /** Custom empty state element */
  emptyState?: React.ReactNode;
  /** Custom loading state element */
  loadingState?: React.ReactNode;
  /** Group options by key */
  groupBy?: (option: ComboboxOption) => string;
  /** Custom option renderer */
  renderOption?: (option: ComboboxOption) => React.ReactNode;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is clearable */
  clearable?: boolean;
  /** Debounce delay for async loadOptions (ms, default 300) */
  debounceMs?: number;
}
