import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Combobox } from './Combobox';
import { ComboboxOption } from './Combobox.types';

const FRAMEWORK_OPTIONS: ComboboxOption[] = [
  { value: 'react', label: 'React', category: 'Frontend' },
  { value: 'vue', label: 'Vue', category: 'Frontend' },
  { value: 'angular', label: 'Angular', category: 'Frontend' },
  { value: 'svelte', label: 'Svelte', category: 'Frontend' },
  { value: 'solidjs', label: 'SolidJS', category: 'Frontend' },
  { value: 'express', label: 'Express', category: 'Backend' },
  { value: 'fastify', label: 'Fastify', category: 'Backend' },
  { value: 'nestjs', label: 'NestJS', category: 'Backend' },
  { value: 'django', label: 'Django', category: 'Backend', disabled: true },
];

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['outlined', 'filled'] },
    validationState: { control: 'select', options: ['default', 'error', 'success', 'warning'] },
  },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

export const Default: Story = {
  args: {
    label: 'Framework',
    placeholder: 'Search frameworks…',
    options: FRAMEWORK_OPTIONS,
  },
};

export const Clearable: Story = {
  args: {
    label: 'Framework',
    options: FRAMEWORK_OPTIONS,
    clearable: true,
    defaultValue: FRAMEWORK_OPTIONS[0],
  },
};

export const Grouped: Story = {
  args: {
    label: 'Framework by category',
    options: FRAMEWORK_OPTIONS,
    groupBy: (o) => String(o.category),
  },
};

export const CustomFilter: Story = {
  args: {
    label: 'Starts with filter',
    options: FRAMEWORK_OPTIONS,
    filter: (opts, q) =>
      opts.filter((o) => o.label.toLowerCase().startsWith(q.toLowerCase())),
    helperText: 'Only shows options that start with your query',
  },
};

const AsyncCombobox = () => {
  const [value, setValue] = useState<ComboboxOption | null>(null);

  const loadOptions = async (query: string): Promise<ComboboxOption[]> => {
    await new Promise((r) => setTimeout(r, 600));
    return FRAMEWORK_OPTIONS.filter((o) =>
      o.label.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <Combobox
      label="Async search"
      loadOptions={loadOptions}
      value={value}
      onChange={setValue}
      placeholder="Type to search…"
      loadingState={<span>Fetching results…</span>}
      helperText="Options loaded asynchronously with 600ms delay"
    />
  );
};

export const Async: Story = {
  render: () => <AsyncCombobox />,
};

export const ValidationStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Combobox label="Default" options={FRAMEWORK_OPTIONS} />
      <Combobox
        label="Error"
        options={FRAMEWORK_OPTIONS}
        validationState="error"
        errorMessage="Please select a framework"
      />
      <Combobox
        label="Success"
        options={FRAMEWORK_OPTIONS}
        validationState="success"
        successMessage="Great choice!"
        defaultValue={FRAMEWORK_OPTIONS[0]}
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Combobox label="Small" options={FRAMEWORK_OPTIONS} size="sm" placeholder="Search…" />
      <Combobox label="Medium" options={FRAMEWORK_OPTIONS} size="md" placeholder="Search…" />
      <Combobox label="Large" options={FRAMEWORK_OPTIONS} size="lg" placeholder="Search…" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    options: FRAMEWORK_OPTIONS,
    defaultValue: FRAMEWORK_OPTIONS[0],
    disabled: true,
  },
};

export const LargeList: Story = {
  render: () => {
    const manyOptions: ComboboxOption[] = Array.from({ length: 1000 }, (_, i) => ({
      value: `opt-${i}`,
      label: `Option ${i + 1}`,
    }));
    return (
      <Combobox
        label="Large list (1000 items)"
        options={manyOptions}
        placeholder="Search…"
        helperText="Searching through 1000 options"
      />
    );
  },
};
