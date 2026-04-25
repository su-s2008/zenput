import React from 'react';
import type { ValidationState } from '../../types';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface FieldContextValue {
  /** Auto-generated (or user-supplied) id for the control element. */
  controlId: string;
  /** Id for the description/helper text element. */
  descriptionId: string;
  /** Id for the message (error/warning/success) element. */
  messageId: string;
  /** Id for the character counter element. */
  counterId: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Whether the field is disabled. */
  disabled?: boolean;
  /** Current validation state. */
  validationState?: ValidationState;
  /**
   * IDs of currently-mounted described-by elements (FieldDescription + FieldMessage).
   * Used to build `aria-describedby` only for elements that are actually rendered.
   */
  describedByIds: readonly string[];
  /** Called by FieldDescription on mount. */
  onDescriptionMount: () => void;
  /** Called by FieldDescription on unmount. */
  onDescriptionUnmount: () => void;
  /** Called by FieldMessage on mount. */
  onMessageMount: () => void;
  /** Called by FieldMessage on unmount. */
  onMessageUnmount: () => void;
}

// ---------------------------------------------------------------------------
// Field (root)
// ---------------------------------------------------------------------------

export interface FieldProps {
  /**
   * Shorthand label text. Renders a `<FieldLabel>` automatically.
   * Use `<FieldLabel>` as a child for advanced composition instead.
   */
  label?: string;
  /**
   * Shorthand description text. Renders a `<FieldDescription>` automatically.
   */
  description?: string;
  /**
   * Shorthand message text. Requires `validationState` (or `error`) to determine styling.
   * Renders a `<FieldMessage>` automatically.
   */
  message?: string;
  /** Validation state drives message styling. */
  validationState?: ValidationState;
  /** Convenience alias – sets `validationState` to `'error'`. */
  error?: boolean;
  /**
   * Whether the field is required.
   * Adds an asterisk to the label and sets `aria-required` on the control.
   */
  required?: boolean;
  /**
   * Whether the field is disabled.
   * Sets `aria-disabled` and the native `disabled` attribute on supported controls.
   */
  disabled?: boolean;
  /**
   * Explicit id for the control element (input, select, textarea…).
   * Auto-generated when omitted.
   */
  id?: string;
  /** Whether the field should take up the full width of its container. */
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// FieldLabel
// ---------------------------------------------------------------------------

export interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// FieldControl
// ---------------------------------------------------------------------------

/** Props injected into the wrapped control by FieldControl. */
export interface FieldControlInjectedProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
  'aria-disabled'?: true;
  disabled?: true;
}

/**
 * Own (non-forwarded) props for FieldControl.
 * Use `FieldControlProps<C>` for the full set of component props.
 */
export interface FieldControlOwnProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Full prop type for `<FieldControl as={C}>`.
 * Combines own props, the `as` prop, and the element/component's own props
 * (minus the injected ARIA/id props which are managed by the Field context).
 */
export type FieldControlProps<C extends React.ElementType = 'div'> = FieldControlOwnProps & {
  /** Element type to render (default: `'div'`). Pass a component like `TextInput`. */
  as?: C;
} & Omit<
    React.ComponentPropsWithoutRef<C>,
    keyof FieldControlInjectedProps | keyof FieldControlOwnProps | 'as'
  >;

// ---------------------------------------------------------------------------
// FieldDescription
// ---------------------------------------------------------------------------

export interface FieldDescriptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// FieldMessage
// ---------------------------------------------------------------------------

export type FieldMessageType = 'error' | 'success' | 'warning' | 'info';

export interface FieldMessageProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Override the message type (defaults to the Field's validationState). */
  type?: FieldMessageType;
  children?: React.ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// FieldCounter
// ---------------------------------------------------------------------------

export interface FieldCounterProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Current character count. */
  current: number;
  /** Maximum character count. */
  max: number;
  className?: string;
}
