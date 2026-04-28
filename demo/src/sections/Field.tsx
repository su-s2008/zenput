import { useState, type InputHTMLAttributes, type ChangeEvent } from 'react';
import {
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldMessage,
  FieldCounter,
  useFieldControlProps,
} from 'zenput';
import { Section, Scenario } from './_shell';

// ---------------------------------------------------------------------------
// Custom control demo using useFieldControlProps
// ---------------------------------------------------------------------------

function StyledInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const fieldProps = useFieldControlProps() as Record<string, unknown>;
  return (
    <input
      {...(fieldProps as InputHTMLAttributes<HTMLInputElement>)}
      {...props}
      style={{
        padding: '6px 10px',
        border: '1px solid var(--zp-color-border-default)',
        borderRadius: 'var(--zp-radius-md)',
        width: '100%',
        background: 'var(--zp-color-surface-input)',
        color: 'var(--zp-color-text-default)',
        ...(fieldProps['aria-invalid'] ? { borderColor: 'var(--zp-color-danger)' } : {}),
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export function FieldSection() {
  const [value, setValue] = useState('');
  const MAX = 80;

  return (
    <Section
      id="field"
      name="Field"
      description="Composable field primitive — wires labels, descriptions, and validation messages to a form control via ARIA attributes."
    >
      <Scenario title="Simple shorthand (label + message props)">
        <Field label="Full name" required message="Name is required" error>
          <FieldControl as="input" type="text" placeholder="Enter your name" />
        </Field>
      </Scenario>

      <Scenario title="Full composition (sub-components)">
        <Field>
          <FieldLabel>Email address</FieldLabel>
          <FieldControl as="input" type="email" placeholder="you@example.com" />
          <FieldDescription>We will never share your email with anyone.</FieldDescription>
        </Field>
      </Scenario>

      <Scenario title="Success validation state">
        <Field validationState="success" label="Username">
          <FieldControl as="input" type="text" defaultValue="johndoe" />
          <FieldMessage type="success">Username is available!</FieldMessage>
        </Field>
      </Scenario>

      <Scenario title="Warning validation state">
        <Field validationState="warning" label="Password">
          <FieldControl as="input" type="password" defaultValue="abc123" />
          <FieldMessage type="warning">Password is weak — add symbols or numbers.</FieldMessage>
        </Field>
      </Scenario>

      <Scenario title="Disabled field">
        <Field label="Company" disabled>
          <FieldControl as="input" type="text" defaultValue="Acme Corp" />
          <FieldDescription>Contact support to change your company name.</FieldDescription>
        </Field>
      </Scenario>

      <Scenario title="Character counter">
        <Field label="Bio" fullWidth>
          <FieldControl
            as="textarea"
            rows={3}
            maxLength={MAX}
            value={value}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
            style={{ width: '100%', resize: 'vertical' }}
          />
          <FieldCounter current={value.length} max={MAX} />
        </Field>
      </Scenario>

      <Scenario title="Custom control via useFieldControlProps">
        <Field label="Custom input" required error message="This field is required">
          <StyledInput type="text" placeholder="Custom styled input" />
        </Field>
      </Scenario>
    </Section>
  );
}
