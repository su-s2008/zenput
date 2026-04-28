'use client';
import { useId } from 'react';
import { ValidationState } from '../types';

interface UseFormFieldOptions {
  id?: string;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  validationState?: ValidationState;
  required?: boolean;
  disabled?: boolean;
}

interface UseFormFieldResult {
  inputId: string;
  helperId: string;
  labelProps: {
    htmlFor: string;
  };
  inputAriaProps: {
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    'aria-required'?: boolean;
    'aria-disabled'?: boolean;
  };
}

export function useFormField({
  id,
  helperText,
  errorMessage,
  validationState,
  required,
  disabled,
}: UseFormFieldOptions): UseFormFieldResult {
  const generatedId = useId();
  const inputId = id ?? `input-${generatedId}`;
  const helperId = `${inputId}-helper`;

  const hasHelperContent = Boolean(helperText || errorMessage);

  return {
    inputId,
    helperId,
    labelProps: { htmlFor: inputId },
    inputAriaProps: {
      ...(hasHelperContent ? { 'aria-describedby': helperId } : {}),
      ...(validationState === 'error' ? { 'aria-invalid': true } : {}),
      ...(required ? { 'aria-required': true } : {}),
      ...(disabled ? { 'aria-disabled': true } : {}),
    },
  };
}
