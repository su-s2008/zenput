import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldMessage,
  FieldCounter,
  useFieldControlProps,
} from './Field';
import styles from './Field.module.css';
import { expectNoA11yViolations } from '../../test-utils/axe';

// ---------------------------------------------------------------------------
// Field (shorthand props)
// ---------------------------------------------------------------------------

describe('Field (shorthand props)', () => {
  it('renders without errors', () => {
    const { container } = render(
      <Field>
        <input />
      </Field>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders shorthand label', () => {
    render(
      <Field label="Full Name">
        <input />
      </Field>
    );
    expect(screen.getByText('Full Name')).toBeInTheDocument();
  });

  it('renders shorthand description', () => {
    render(
      <Field description="Enter your full name">
        <input />
      </Field>
    );
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('renders shorthand message', () => {
    render(
      <Field message="This field is required" validationState="error">
        <input />
      </Field>
    );
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('sets validationState to error when error prop is true', () => {
    render(
      <Field error message="Error occurred">
        <input />
      </Field>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('renders with fullWidth prop without error', () => {
    const { container } = render(
      <Field fullWidth>
        <input />
      </Field>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('label is a label element when required is true', () => {
    render(
      <Field label="Name" required>
        <input />
      </Field>
    );
    const label = screen.getByText('Name').closest('label');
    expect(label).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// FieldLabel
// ---------------------------------------------------------------------------

describe('FieldLabel', () => {
  it('renders label text', () => {
    render(
      <Field>
        <FieldLabel>My Label</FieldLabel>
        <input />
      </Field>
    );
    expect(screen.getByText('My Label')).toBeInTheDocument();
  });

  it('associates label with control via htmlFor', () => {
    render(
      <Field id="my-input">
        <FieldLabel>Label</FieldLabel>
        <input id="my-input" />
      </Field>
    );
    const label = screen.getByText('Label');
    expect(label).toHaveAttribute('for', 'my-input');
  });

  it('label element is rendered when Field is required', () => {
    render(
      <Field required>
        <FieldLabel>Label</FieldLabel>
        <input />
      </Field>
    );
    const label = screen.getByText('Label').closest('label');
    expect(label).not.toBeNull();
  });

  it('throws if rendered outside Field', () => {
    // suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FieldLabel>Label</FieldLabel>)).toThrow();
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// FieldControl
// ---------------------------------------------------------------------------

describe('FieldControl', () => {
  it('renders a div by default with the injected id', () => {
    const { container } = render(
      <Field id="ctrl">
        <FieldControl>content</FieldControl>
      </Field>
    );
    const control = container.querySelector('#ctrl');
    expect(control).toBeInTheDocument();
    expect(control?.tagName).toBe('DIV');
  });

  it('renders as a custom element type', () => {
    const { container } = render(
      <Field id="ctrl">
        <FieldControl as="input" />
      </Field>
    );
    expect(container.querySelector('input')).toBeInTheDocument();
  });

  it('sets the id from Field context', () => {
    const { container } = render(
      <Field id="my-field">
        <FieldControl as="input" />
      </Field>
    );
    expect(container.querySelector('input')).toHaveAttribute('id', 'my-field');
  });

  it('sets aria-invalid when validationState is error', () => {
    const { container } = render(
      <Field id="my-field" validationState="error">
        <FieldControl as="input" />
      </Field>
    );
    expect(container.querySelector('input')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-required when required', () => {
    const { container } = render(
      <Field id="my-field" required>
        <FieldControl as="input" />
      </Field>
    );
    expect(container.querySelector('input')).toHaveAttribute('aria-required', 'true');
  });

  it('sets aria-disabled and native disabled when disabled', () => {
    const { container } = render(
      <Field id="my-field" disabled>
        <FieldControl as="input" />
      </Field>
    );
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('aria-disabled', 'true');
    expect(input).toBeDisabled();
  });

  it('merges consumer-provided aria-describedby with field-generated ids', () => {
    const { container } = render(
      <Field id="my-field">
        <FieldControl as="input" aria-describedby="external-hint" />
        <FieldDescription>hint</FieldDescription>
      </Field>
    );
    const input = container.querySelector('input');
    const describedBy = input?.getAttribute('aria-describedby') ?? '';
    expect(describedBy).toContain('external-hint');
    expect(describedBy).toContain('my-field-description');
  });

  it('sets aria-describedby only when description or message are rendered', () => {
    const { container } = render(
      <Field id="my-field">
        <FieldControl as="input" />
      </Field>
    );
    // No FieldDescription or FieldMessage — aria-describedby should not be set
    expect(container.querySelector('input')).not.toHaveAttribute('aria-describedby');
  });

  it('sets aria-describedby when FieldDescription is rendered', () => {
    const { container } = render(
      <Field id="my-field">
        <FieldControl as="input" />
        <FieldDescription>A description</FieldDescription>
      </Field>
    );
    const input = container.querySelector('input');
    expect(input?.getAttribute('aria-describedby')).toContain('my-field-description');
  });

  it('throws if rendered outside Field', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FieldControl as="input" />)).toThrow();
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// FieldDescription
// ---------------------------------------------------------------------------

describe('FieldDescription', () => {
  it('renders description text', () => {
    render(
      <Field>
        <FieldDescription>Helpful hint</FieldDescription>
        <input />
      </Field>
    );
    expect(screen.getByText('Helpful hint')).toBeInTheDocument();
  });

  it('has the expected id', () => {
    render(
      <Field id="f">
        <FieldDescription>hint</FieldDescription>
        <input />
      </Field>
    );
    const desc = screen.getByText('hint');
    expect(desc).toHaveAttribute('id', 'f-description');
  });

  it('throws if rendered outside Field', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FieldDescription>desc</FieldDescription>)).toThrow();
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// FieldMessage
// ---------------------------------------------------------------------------

describe('FieldMessage', () => {
  it('renders message text', () => {
    render(
      <Field validationState="error">
        <FieldMessage>Error occurred</FieldMessage>
        <input />
      </Field>
    );
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('uses role="alert" for error messages', () => {
    render(
      <Field validationState="error">
        <FieldMessage>Error</FieldMessage>
        <input />
      </Field>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="status" for success messages', () => {
    render(
      <Field>
        <FieldMessage type="success">Success</FieldMessage>
        <input />
      </Field>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('uses role="status" for warning messages', () => {
    render(
      <Field>
        <FieldMessage type="warning">Warning</FieldMessage>
        <input />
      </Field>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('uses role="status" when validationState is warning', () => {
    render(
      <Field validationState="warning">
        <FieldMessage>Watch out</FieldMessage>
        <input />
      </Field>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Watch out')).toBeInTheDocument();
  });

  it('uses role="alert" for explicit error type', () => {
    render(
      <Field>
        <FieldMessage type="error">Error</FieldMessage>
        <input />
      </Field>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('throws if rendered outside Field', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FieldMessage>msg</FieldMessage>)).toThrow();
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// FieldCounter
// ---------------------------------------------------------------------------

describe('FieldCounter', () => {
  it('renders current/max', () => {
    render(
      <Field>
        <FieldCounter current={5} max={20} />
        <input />
      </Field>
    );
    expect(screen.getByText('5/20')).toBeInTheDocument();
  });

  it('applies exceeded style when current > max', () => {
    render(
      <Field>
        <FieldCounter current={25} max={20} />
        <input />
      </Field>
    );
    expect(screen.getByText('25/20')).toHaveClass(styles.exceeded);
  });

  it('does not apply exceeded style when current <= max', () => {
    render(
      <Field>
        <FieldCounter current={10} max={20} />
        <input />
      </Field>
    );
    expect(screen.getByText('10/20')).not.toHaveClass(styles.exceeded);
  });

  it('has aria-live="polite"', () => {
    render(
      <Field>
        <FieldCounter current={5} max={20} />
        <input />
      </Field>
    );
    expect(screen.getByText('5/20')).toHaveAttribute('aria-live', 'polite');
  });

  it('throws if rendered outside Field', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FieldCounter current={0} max={10} />)).toThrow();
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// useFieldControlProps
// ---------------------------------------------------------------------------

describe('useFieldControlProps', () => {
  it('returns empty object when used outside Field', () => {
    let result: Record<string, unknown> = { sentinel: true };
    function Consumer() {
      result = useFieldControlProps();
      return null;
    }
    render(<Consumer />);
    expect(result).toEqual({});
  });

  it('returns id inside Field', () => {
    let result: Record<string, unknown> = {};
    function Consumer() {
      result = useFieldControlProps();
      return null;
    }
    render(
      <Field id="test-field">
        <Consumer />
      </Field>
    );
    expect(result.id).toBe('test-field');
  });

  it('does not include aria-describedby when no description or message is rendered', () => {
    let result: Record<string, unknown> = {};
    function Consumer() {
      result = useFieldControlProps();
      return null;
    }
    render(
      <Field id="test-field">
        <Consumer />
      </Field>
    );
    expect(result['aria-describedby']).toBeUndefined();
  });

  it('includes aria-describedby when FieldDescription is rendered', () => {
    let result: Record<string, unknown> = {};
    function Consumer() {
      result = useFieldControlProps();
      return null;
    }
    render(
      <Field id="test-field">
        <Consumer />
        <FieldDescription>A description</FieldDescription>
      </Field>
    );
    expect(result['aria-describedby']).toContain('test-field-description');
  });

  it('includes aria-invalid when validationState is error', () => {
    let result: Record<string, unknown> = {};
    function Consumer() {
      result = useFieldControlProps();
      return null;
    }
    render(
      <Field id="test-field" validationState="error">
        <Consumer />
      </Field>
    );
    expect(result['aria-invalid']).toBe(true);
  });

  it('includes disabled when Field is disabled', () => {
    let result: Record<string, unknown> = {};
    function Consumer() {
      result = useFieldControlProps();
      return null;
    }
    render(
      <Field id="test-field" disabled>
        <Consumer />
      </Field>
    );
    expect(result['aria-disabled']).toBe(true);
    expect(result['disabled']).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Accessibility (axe)
// ---------------------------------------------------------------------------

describe('a11y (axe)', () => {
  it('has no violations with shorthand label', async () => {
    const { container } = render(
      <Field label="Name" required>
        <FieldControl as="input" type="text" />
      </Field>
    );
    await expectNoA11yViolations(container);
  });

  it('has no violations with advanced composition', async () => {
    const { container } = render(
      <Field id="adv-field">
        <FieldLabel>Email</FieldLabel>
        <FieldControl as="input" type="email" />
        <FieldDescription>We will never share your email</FieldDescription>
      </Field>
    );
    await expectNoA11yViolations(container);
  });
});
