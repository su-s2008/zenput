import React from 'react';
import { BaseInputProps } from '../../types';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Group key – used when groupBy is provided */
  [key: string]: unknown;
}

export interface MultiSelectProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'size' | 'onChange' | 'defaultValue' | 'value' | 'children' | 'dangerouslySetInnerHTML'
  >,
    BaseInputProps {
  /** Static list of options */
  options?: MultiSelectOption[];
  /** Async function to load options based on search query */
  loadOptions?: (query: string) => Promise<MultiSelectOption[]>;
  /** Currently selected values (controlled) */
  value?: MultiSelectOption[];
  /** Default selected values (uncontrolled) */
  defaultValue?: MultiSelectOption[];
  /** Called when selection changes */
  onChange?: (selected: MultiSelectOption[]) => void;
  /** Group options by a key extracted from each option */
  groupBy?: (option: MultiSelectOption) => string;
  /** Custom option renderer */
  renderOption?: (option: MultiSelectOption) => React.ReactNode;
  /** Custom tag/chip renderer */
  renderTag?: (option: MultiSelectOption, onRemove: () => void) => React.ReactNode;
  /** Allow free-form entries not in options list */
  creatable?: boolean;
  /** Custom validation for free-form entries */
  isValidNewOption?: (inputValue: string, selected: MultiSelectOption[]) => boolean;
  /** Custom label for the "create" option */
  formatCreateLabel?: (inputValue: string) => React.ReactNode;
  /** Maximum number of tags */
  maxTags?: number;
  /** Whether the input is searchable (default: true) */
  searchable?: boolean;
  /** Show a clear-all button */
  clearable?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Message when no options match */
  noOptionsMessage?: string;
  /** Whether the dropdown is in a loading state */
  loading?: boolean;
  /** Debounce delay for async loadOptions (ms, default 300) */
  debounceMs?: number;
}
