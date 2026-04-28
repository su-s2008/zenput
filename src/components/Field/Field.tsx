'use client';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import { classNames } from '../../utils';
import styles from './Field.module.css';
import type {
  FieldContextValue,
  FieldControlProps,
  FieldCounterProps,
  FieldDescriptionProps,
  FieldLabelProps,
  FieldMessageProps,
  FieldMessageType,
  FieldProps,
} from './Field.types';
import type { ValidationState } from '../../types';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const FieldContext = createContext<FieldContextValue | null>(null);

function useFieldContext(): FieldContextValue {
  const ctx = useContext(FieldContext);
  if (!ctx) {
    throw new Error('Field sub-components must be rendered inside <Field>.');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Field (root)
// ---------------------------------------------------------------------------

/**
 * Composable field primitive that wires up labels, descriptions, and
 * validation messages to a form control via ARIA attributes.
 *
 * @example Simple usage
 * ```tsx
 * <Field label="Name" required error={hasError} message="Name is required">
 *   <FieldControl as={TextInput} />
 * </Field>
 * ```
 *
 * @example Advanced composition
 * ```tsx
 * <Field>
 *   <FieldLabel>Name</FieldLabel>
 *   <FieldControl as={TextInput} placeholder="Enter name" />
 *   <FieldDescription>Your full legal name</FieldDescription>
 *   <FieldMessage type="error">Name is required</FieldMessage>
 * </Field>
 * ```
 */
export function Field({
  label,
  description,
  message,
  validationState,
  error,
  required,
  disabled,
  id,
  fullWidth,
  className,
  style,
  children,
}: FieldProps): React.ReactElement {
  const generatedId = useId();
  const controlId = id ?? `field-${generatedId}`;
  const descriptionId = `${controlId}-description`;
  const messageId = `${controlId}-message`;
  const counterId = `${controlId}-counter`;

  // Convenience: `error` prop overrides validationState to 'error'
  const resolvedValidationState: ValidationState | undefined = error ? 'error' : validationState;

  // Track which described-by elements are actually mounted so aria-describedby
  // only references IDs that exist in the DOM.
  const [descriptionMounted, setDescriptionMounted] = useState(false);
  const [messageMounted, setMessageMounted] = useState(false);

  const onDescriptionMount = useCallback(() => setDescriptionMounted(true), []);
  const onDescriptionUnmount = useCallback(() => setDescriptionMounted(false), []);
  const onMessageMount = useCallback(() => setMessageMounted(true), []);
  const onMessageUnmount = useCallback(() => setMessageMounted(false), []);

  const describedByIds = useMemo<readonly string[]>(() => {
    const ids: string[] = [];
    if (descriptionMounted) ids.push(descriptionId);
    if (messageMounted) ids.push(messageId);
    return ids;
  }, [descriptionMounted, messageMounted, descriptionId, messageId]);

  const ctx = useMemo<FieldContextValue>(
    () => ({
      controlId,
      descriptionId,
      messageId,
      counterId,
      required,
      disabled,
      validationState: resolvedValidationState,
      describedByIds,
      onDescriptionMount,
      onDescriptionUnmount,
      onMessageMount,
      onMessageUnmount,
    }),
    [
      controlId,
      descriptionId,
      messageId,
      counterId,
      required,
      disabled,
      resolvedValidationState,
      describedByIds,
      onDescriptionMount,
      onDescriptionUnmount,
      onMessageMount,
      onMessageUnmount,
    ]
  );

  return (
    <FieldContext.Provider value={ctx}>
      <div
        className={classNames(styles.field, fullWidth ? styles.fullWidth : undefined, className)}
        style={style}
      >
        {label && <FieldLabel>{label}</FieldLabel>}
        {children}
        {description && <FieldDescription>{description}</FieldDescription>}
        {/* Omit the `type` prop so FieldMessage resolves styling from validationState context,
            avoiding the risk of forwarding 'default' as an invalid message type. */}
        {message && <FieldMessage>{message}</FieldMessage>}
      </div>
    </FieldContext.Provider>
  );
}
Field.displayName = 'Field';

// ---------------------------------------------------------------------------
// FieldLabel
// ---------------------------------------------------------------------------

/**
 * Label element for the field. Automatically associates with the control via
 * `htmlFor`.
 */
export function FieldLabel({ children, className, ...rest }: Readonly<FieldLabelProps>): React.ReactElement {
  const { controlId, required } = useFieldContext();

  return (
    <label
      {...rest}
      htmlFor={controlId}
      className={classNames(styles.label, required ? styles.required : undefined, className)}
    >
      {children}
    </label>
  );
}
FieldLabel.displayName = 'FieldLabel';

// ---------------------------------------------------------------------------
// FieldControl
// ---------------------------------------------------------------------------

/** Intrinsic HTML elements that accept the native `disabled` attribute. */
const DISABLED_ELEMENTS = new Set([
  'input',
  'select',
  'textarea',
  'button',
  'fieldset',
  'optgroup',
  'option',
]);

/**
 * Wraps a form control and injects the correct `id` and ARIA attributes from
 * the surrounding `<Field>` context.
 *
 * For simple inputs pass `as={TextInput}`:
 * ```tsx
 * <FieldControl as={TextInput} placeholder="Enter name" />
 * ```
 *
 * For controls that already manage their own id/aria props you can instead
 * render the control directly as a child of `<Field>` and use
 * `useFieldControlProps()` to spread the props manually.
 */
export function FieldControl<C extends React.ElementType = 'div'>({
  as,
  className,
  style,
  children,
  ...rest
}: FieldControlProps<C>): React.ReactElement {
  const Component = (as ?? 'div') as React.ElementType;
  const { controlId, describedByIds, required, disabled, validationState } = useFieldContext();

  // Merge any consumer-supplied aria-describedby with field-generated ids.
  const restRecord = rest as Record<string, unknown>;
  const consumerDescribedBy =
    typeof restRecord['aria-describedby'] === 'string'
      ? restRecord['aria-describedby'].trim().split(/\s+/).filter(Boolean)
      : [];
  const mergedDescribedByIds = [...consumerDescribedBy, ...describedByIds];
  const ariaDescribedBy =
    mergedDescribedByIds.length > 0 ? mergedDescribedByIds.join(' ') : undefined;

  // Only set native `disabled` for elements/components that support it.
  const supportsNativeDisabled =
    typeof Component === 'string' ? DISABLED_ELEMENTS.has(Component) : true;

  const injected: Record<string, unknown> = {
    id: controlId,
    ...(ariaDescribedBy !== undefined ? { 'aria-describedby': ariaDescribedBy } : {}),
    ...(validationState === 'error' ? { 'aria-invalid': true as const } : {}),
    ...(required ? { 'aria-required': true as const } : {}),
    ...(disabled ? { 'aria-disabled': true as const } : {}),
    ...(disabled && supportsNativeDisabled ? { disabled: true } : {}),
  };

  return (
    <Component {...rest} {...injected} className={className} style={style}>
      {children}
    </Component>
  );
}
FieldControl.displayName = 'FieldControl';

// ---------------------------------------------------------------------------
// FieldDescription
// ---------------------------------------------------------------------------

/**
 * Helper / description text displayed below the control.
 */
export function FieldDescription({
  children,
  className,
  ...rest
}: FieldDescriptionProps): React.ReactElement {
  const { descriptionId, onDescriptionMount, onDescriptionUnmount } = useFieldContext();

  useEffect(() => {
    onDescriptionMount();
    return onDescriptionUnmount;
  }, [onDescriptionMount, onDescriptionUnmount]);

  return (
    <span {...rest} id={descriptionId} className={classNames(styles.description, className)}>
      {children}
    </span>
  );
}
FieldDescription.displayName = 'FieldDescription';

// ---------------------------------------------------------------------------
// FieldMessage
// ---------------------------------------------------------------------------

function resolveMessageType(
  type: FieldMessageType | undefined,
  validationState: ValidationState | undefined
): FieldMessageType | undefined {
  if (type) return type;
  if (validationState === 'error') return 'error';
  if (validationState === 'success') return 'success';
  if (validationState === 'warning') return 'warning';
  return undefined;
}

/**
 * Validation/status message displayed below the control.
 * The `type` prop controls the colour; it defaults to the Field's
 * `validationState`.
 *
 * Uses `role="alert"` for errors (assertive) and `role="status"` for all
 * other types (polite) to avoid noisy screen-reader interruptions.
 */
export function FieldMessage({
  type,
  children,
  className,
  ...rest
}: FieldMessageProps): React.ReactElement {
  const { messageId, validationState, onMessageMount, onMessageUnmount } = useFieldContext();
  const resolvedType = resolveMessageType(type, validationState);

  useEffect(() => {
    onMessageMount();
    return onMessageUnmount;
  }, [onMessageMount, onMessageUnmount]);

  // Use assertive "alert" only for errors; polite "status" for all other types.
  const role = resolvedType === 'error' ? 'alert' : 'status';

  return (
    <span
      {...rest}
      id={messageId}
      role={role}
      className={classNames(
        styles.message,
        resolvedType ? styles[resolvedType] : undefined,
        className
      )}
    >
      {children}
    </span>
  );
}
FieldMessage.displayName = 'FieldMessage';

// ---------------------------------------------------------------------------
// FieldCounter
// ---------------------------------------------------------------------------

/**
 * Character counter. Turns red when the current count exceeds `max`.
 */
export function FieldCounter({
  current,
  max,
  className,
  ...rest
}: FieldCounterProps): React.ReactElement {
  const { counterId } = useFieldContext();
  const exceeded = current > max;

  return (
    <span
      {...rest}
      id={counterId}
      aria-live="polite"
      className={classNames(styles.counter, exceeded ? styles.exceeded : undefined, className)}
    >
      {current}/{max}
    </span>
  );
}
FieldCounter.displayName = 'FieldCounter';

// ---------------------------------------------------------------------------
// Hook: useFieldControlProps
// ---------------------------------------------------------------------------

/**
 * Returns the ARIA props that should be spread onto a custom control rendered
 * inside a `<Field>`. Useful when you cannot use `<FieldControl as={…}>`.
 *
 * @example
 * ```tsx
 * function MyInput(props) {
 *   const fieldProps = useFieldControlProps();
 *   return <input {...fieldProps} {...props} />;
 * }
 * ```
 */
export function useFieldControlProps() {
  const ctx = useContext(FieldContext);
  if (!ctx) return {};

  const { controlId, describedByIds, required, disabled, validationState } = ctx;
  const ariaDescribedBy = describedByIds.length > 0 ? describedByIds.join(' ') : undefined;

  return {
    id: controlId,
    ...(ariaDescribedBy !== undefined ? { 'aria-describedby': ariaDescribedBy } : {}),
    ...(validationState === 'error' ? { 'aria-invalid': true as const } : {}),
    ...(required ? { 'aria-required': true as const } : {}),
    ...(disabled ? { 'aria-disabled': true as const } : {}),
    ...(disabled ? { disabled: true as const } : {}),
  };
}
