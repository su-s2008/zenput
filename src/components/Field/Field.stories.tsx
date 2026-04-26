import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldMessage,
  FieldCounter,
} from './Field';

const meta: Meta<typeof Field> = {
  title: 'Components/Field',
  component: Field,
  tags: ['autodocs'],
  argTypes: {
    validationState: {
      control: 'select',
      options: ['default', 'error', 'success', 'warning'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Field>;

// ---------------------------------------------------------------------------
// Default (shorthand props)
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    label: 'Full Name',
  },
  render: (args) => (
    <Field {...args}>
      <FieldControl as="input" type="text" placeholder="Enter your name" />
    </Field>
  ),
};

// ---------------------------------------------------------------------------
// Shorthand label + description + message
// ---------------------------------------------------------------------------

export const ShorthandProps: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Field label="Email" description="We will never share your email." required>
        <FieldControl as="input" type="email" placeholder="you@example.com" />
      </Field>

      <Field label="Username" validationState="error" message="Username is already taken.">
        <FieldControl as="input" type="text" placeholder="Pick a username" />
      </Field>

      <Field label="Password" validationState="success" message="Password is strong!">
        <FieldControl as="input" type="password" placeholder="Enter password" />
      </Field>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Advanced composition with sub-components
// ---------------------------------------------------------------------------

export const AdvancedComposition: Story = {
  render: () => (
    <Field id="name-field">
      <FieldLabel>Full Name</FieldLabel>
      <FieldControl as="input" type="text" placeholder="Jane Doe" />
      <FieldDescription>As it appears on your government-issued ID.</FieldDescription>
    </Field>
  ),
};

// ---------------------------------------------------------------------------
// Validation states
// ---------------------------------------------------------------------------

export const ValidationStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Field id="field-default">
        <FieldLabel>Default</FieldLabel>
        <FieldControl as="input" type="text" placeholder="Default state" />
        <FieldDescription>Helper text below the input.</FieldDescription>
      </Field>

      <Field id="field-error" validationState="error">
        <FieldLabel>Error</FieldLabel>
        <FieldControl as="input" type="text" placeholder="Error state" />
        <FieldMessage>This field is required.</FieldMessage>
      </Field>

      <Field id="field-success" validationState="success">
        <FieldLabel>Success</FieldLabel>
        <FieldControl as="input" type="text" placeholder="Success state" />
        <FieldMessage>Looks good!</FieldMessage>
      </Field>

      <Field id="field-warning" validationState="warning">
        <FieldLabel>Warning</FieldLabel>
        <FieldControl as="input" type="text" placeholder="Warning state" />
        <FieldMessage>Please double-check this value.</FieldMessage>
      </Field>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Required / disabled
// ---------------------------------------------------------------------------

export const RequiredAndDisabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Field label="Required Field" required>
        <FieldControl as="input" type="text" placeholder="Required input" />
      </Field>

      <Field label="Disabled Field" disabled>
        <FieldControl as="input" type="text" placeholder="Cannot edit" />
      </Field>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// With character counter
// ---------------------------------------------------------------------------

function WithCounterExample() {
  const MAX = 100;
  const [value, setValue] = useState('');
  return (
    <Field id="bio-field">
      <FieldLabel>Bio</FieldLabel>
      <FieldControl
        as="textarea"
        rows={3}
        placeholder="Tell us about yourself…"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        style={{ width: '100%', resize: 'vertical', padding: '8px', boxSizing: 'border-box' }}
      />
      <FieldCounter current={value.length} max={MAX} />
    </Field>
  );
}

export const WithCounter: Story = {
  render: () => <WithCounterExample />,
};

// ---------------------------------------------------------------------------
// Full width
// ---------------------------------------------------------------------------

export const FullWidth: Story = {
  render: () => (
    <Field label="Full Width Field" fullWidth>
      <FieldControl
        as="input"
        type="text"
        placeholder="This field takes up full width"
        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
      />
    </Field>
  ),
};

// ---------------------------------------------------------------------------
// Inline error (error convenience prop)
// ---------------------------------------------------------------------------

export const ErrorProp: Story = {
  render: () => (
    <Field label="Email" error message="A valid email is required.">
      <FieldControl as="input" type="email" placeholder="Enter email" />
    </Field>
  ),
};

// ---------------------------------------------------------------------------
// All sub-components together
// ---------------------------------------------------------------------------

function AllSubComponentsExample() {
  const MAX = 50;
  const [value, setValue] = useState('');
  const hasError = value.length > MAX;
  return (
    <Field id="message-field" validationState={hasError ? 'error' : 'default'} required>
      <FieldLabel>Message</FieldLabel>
      <FieldControl
        as="textarea"
        rows={3}
        placeholder="Type your message…"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        style={{ width: '100%', resize: 'vertical', padding: '8px', boxSizing: 'border-box' }}
      />
      <FieldDescription>Keep it brief and to the point.</FieldDescription>
      {hasError && (
        <FieldMessage type="error">Message must be {MAX} characters or less.</FieldMessage>
      )}
      <FieldCounter current={value.length} max={MAX} />
    </Field>
  );
}

export const AllSubComponents: Story = {
  render: () => <AllSubComponentsExample />,
};
