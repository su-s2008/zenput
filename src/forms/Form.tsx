'use client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Controller, FormProvider, useFormContext, useFormState } from 'react-hook-form';
import type { FieldErrors, FieldValues, Path } from 'react-hook-form';
import { classNames } from '../utils';
import type {
  FormProps,
  FormFieldProps,
  FormSubmitProps,
  FormResetProps,
  FormErrorSummaryProps,
} from './Form.types';
import styles from './Form.module.css';

// ---------------------------------------------------------------------------
// Internal context — exposes the form instance to sub-components
// ---------------------------------------------------------------------------

interface FormInternalContextValue {
  disabled?: boolean;
}

const FormInternalContext = createContext<FormInternalContextValue>({});

function useFormInternal(): FormInternalContextValue {
  return useContext(FormInternalContext);
}

// ---------------------------------------------------------------------------
// FormRoot
// ---------------------------------------------------------------------------

function FormRoot<TFieldValues extends FieldValues = FieldValues>({
  form,
  onSubmit,
  onError,
  children,
  className,
  style,
  ...rest
}: Readonly<FormProps<TFieldValues>>): React.ReactElement {
  const { handleSubmit, formState } = form;

  const formInternalValue = useMemo(
    () => ({ disabled: formState.isSubmitting }),
    [formState.isSubmitting]
  );

  return (
    <FormProvider {...form}>
      <FormInternalContext.Provider value={formInternalValue}>
        <form
          {...rest}
          className={classNames(styles.form, className)}
          style={style}
          onSubmit={handleSubmit(onSubmit, onError)}
          noValidate
          aria-busy={formState.isSubmitting || undefined}
        >
          {children}
        </form>
      </FormInternalContext.Provider>
    </FormProvider>
  );
}

FormRoot.displayName = 'Form';

// ---------------------------------------------------------------------------
// Form.Field
// ---------------------------------------------------------------------------

function FormField<TFieldValues extends FieldValues = FieldValues>({
  name,
  children,
  descriptionId,
  disabled: fieldDisabled,
}: Readonly<FormFieldProps<TFieldValues>>): React.ReactElement {
  const { control } = useFormContext<TFieldValues>();
  const { disabled: formDisabled } = useFormInternal();
  const isDisabled = fieldDisabled ?? formDisabled;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const hasError = Boolean(fieldState.error);
        const errorMessage = fieldState.error?.message;
        // Only inject the consumer-provided `descriptionId`.
        // Zenput inputs compute their own `aria-describedby` for the helper
        // text element (via `useFormField`), so we don't fabricate an error
        // id here that would point to a non-existent element.
        const describedBy = descriptionId || undefined;

        return (
          <>
            {children({
              props: {
                name: String(name),
                value: field.value ?? '',
                onChange: field.onChange,
                onBlur: field.onBlur,
                ref: field.ref,
                disabled: isDisabled,
                validationState: hasError ? 'error' : 'default',
                errorMessage,
                ...(hasError ? { 'aria-invalid': true as const } : {}),
                ...(describedBy ? { 'aria-describedby': describedBy } : {}),
              },
              invalid: hasError,
              errorMessage,
            })}
          </>
        );
      }}
    />
  );
}

FormField.displayName = 'Form.Field';

// ---------------------------------------------------------------------------
// Form.Submit
// ---------------------------------------------------------------------------

function FormSubmit({ children = 'Submit', className, ...rest }: Readonly<FormSubmitProps>): React.ReactElement {
  const { disabled: formDisabled } = useFormInternal();
  const { isSubmitting } = useFormState();

  return (
    <button
      {...rest}
      type="submit"
      disabled={isSubmitting || formDisabled}
      aria-busy={isSubmitting || undefined}
      className={className ?? styles.submitButton}
    >
      {children}
    </button>
  );
}

FormSubmit.displayName = 'Form.Submit';

// ---------------------------------------------------------------------------
// Form.Reset
// ---------------------------------------------------------------------------

function FormReset({
  children = 'Reset',
  className,
  onClick,
  ...rest
}: Readonly<FormResetProps>): React.ReactElement {
  const { disabled: formDisabled } = useFormInternal();
  const { isSubmitting } = useFormState();
  // With react-hook-form's Controller, inputs are controlled by RHF state, so
  // a native form reset won't clear values/errors. Wire the click to RHF's
  // `reset()` (from `useFormContext`) so the form is reset reliably.
  const { reset } = useFormContext<FieldValues>();

  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      reset();
    },
    [onClick, reset]
  );

  return (
    <button
      {...rest}
      type="button"
      disabled={isSubmitting || formDisabled}
      className={className ?? styles.resetButton}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

FormReset.displayName = 'Form.Reset';

// ---------------------------------------------------------------------------
// Form.ErrorSummary
// ---------------------------------------------------------------------------

interface FlatError {
  /** Full dot/bracket path of the field (e.g. `address.street`, `items.0.name`). */
  path: string;
  /** Human-readable error message. */
  message: string;
}

/**
 * Recursively flatten react-hook-form's nested `FieldErrors` tree into a flat
 * list of leaf errors. Preserves the full dotted path for nested objects and
 * `array.<index>` for arrays.
 */
function flattenErrors(
  errors: FieldErrors | undefined,
  prefix = ''
): FlatError[] {
  if (!errors) return [];
  const result: FlatError[] = [];
  for (const [key, value] of Object.entries(errors)) {
    if (value == null) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    // Leaf error: has a `message` and/or `type` property and no further nested
    // field-shaped children.
    const v = value as { message?: string; type?: string | number } & Record<string, unknown>;
    if (typeof v.message === 'string' || v.type !== undefined) {
      result.push({ path, message: v.message ?? `${path} is invalid` });
    } else if (Array.isArray(value)) {
      value.forEach((entry, index) => {
        result.push(...flattenErrors(entry as FieldErrors, `${path}.${index}`));
      });
    } else if (typeof value === 'object') {
      result.push(...flattenErrors(value as FieldErrors, path));
    }
  }
  return result;
}

function FormErrorSummary({
  heading = 'Please fix the following errors:',
  className,
  style,
}: Readonly<FormErrorSummaryProps>): React.ReactElement | null {
  const { errors } = useFormState();
  const { setFocus } = useFormContext<FieldValues>();
  const containerRef = useRef<HTMLDivElement>(null);
  const prevHadErrors = useRef(false);

  const flatErrors = flattenErrors(errors);
  const hasErrors = flatErrors.length > 0;

  // Focus the container when errors first appear (e.g., after submit).
  useEffect(() => {
    if (hasErrors && !prevHadErrors.current) {
      containerRef.current?.focus();
    }
    prevHadErrors.current = hasErrors;
  }, [hasErrors]);

  // Use react-hook-form's `setFocus` so that nested paths and special
  // characters in field names are handled correctly.
  const focusField = useCallback(
    (fieldPath: string) => {
      try {
        setFocus(fieldPath as Path<FieldValues>); // NOSONAR
      } catch {
        // Fallback: locate the input by its escaped name attribute.
        if (typeof window !== 'undefined' && typeof CSS !== 'undefined' && CSS.escape) {
          const el = document.querySelector<HTMLElement>(
            `[name="${CSS.escape(fieldPath)}"]`
          );
          el?.focus();
        }
      }
    },
    [setFocus]
  );

  if (!hasErrors) return null;

  return (
    <div
      ref={containerRef}
      role="alert"
      aria-atomic="true"
      tabIndex={-1}
      className={className ?? styles.errorSummary}
      style={style}
    >
      <p className={styles.errorSummaryHeading}>{heading}</p>
      <ul className={styles.errorSummaryList}>
        {flatErrors.map(({ path, message }) => (
          <li key={path}>
            <button
              type="button"
              className={styles.errorSummaryItem}
              onClick={() => focusField(path)}
            >
              {message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

FormErrorSummary.displayName = 'Form.ErrorSummary';

// ---------------------------------------------------------------------------
// Compound component
// ---------------------------------------------------------------------------

/**
 * `<Form>` — thin wrapper around react-hook-form that wires up Zenput inputs.
 *
 * Use together with `useZenputForm` to get the form instance:
 *
 * ```tsx
 * import { Form, useZenputForm } from 'zenput/forms';
 * import { z } from 'zod';
 *
 * const schema = z.object({ email: z.string().email() });
 * const form = useZenputForm({ schema, defaultValues: { email: '' } });
 *
 * <Form form={form} onSubmit={values => console.log(values)}>
 *   <Form.Field name="email">
 *     {(field) => <TextInput label="Email" {...field.props} />}
 *   </Form.Field>
 *   <Form.Submit>Send</Form.Submit>
 * </Form>
 * ```
 */
export const Form = Object.assign(FormRoot, {
  Field: FormField,
  Submit: FormSubmit,
  Reset: FormReset,
  ErrorSummary: FormErrorSummary,
});
