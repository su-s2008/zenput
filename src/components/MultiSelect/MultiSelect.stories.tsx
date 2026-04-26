import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MultiSelect } from './MultiSelect';
import { MultiSelectOption } from './MultiSelect.types';

const FRAMEWORK_OPTIONS: MultiSelectOption[] = [
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

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['outlined', 'filled'] },
    validationState: { control: 'select', options: ['default', 'error', 'success', 'warning'] },
  },
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

export const Default: Story = {
  args: {
    label: 'Frameworks',
    placeholder: 'Select frameworks…',
    options: FRAMEWORK_OPTIONS,
  },
};

export const WithPreselected: Story = {
  args: {
    label: 'Frameworks',
    options: FRAMEWORK_OPTIONS,
    defaultValue: [FRAMEWORK_OPTIONS[0], FRAMEWORK_OPTIONS[2]],
  },
};

export const Clearable: Story = {
  args: {
    label: 'Frameworks',
    options: FRAMEWORK_OPTIONS,
    defaultValue: [FRAMEWORK_OPTIONS[0], FRAMEWORK_OPTIONS[1]],
    clearable: true,
  },
};

export const Creatable: Story = {
  args: {
    label: 'Technologies',
    options: FRAMEWORK_OPTIONS,
    creatable: true,
    helperText: 'Type a custom value and press Enter to add it',
  },
};

export const MaxTags: Story = {
  args: {
    label: 'Pick up to 2',
    options: FRAMEWORK_OPTIONS,
    maxTags: 2,
    helperText: 'Maximum 2 items',
  },
};

export const Grouped: Story = {
  args: {
    label: 'Frameworks by category',
    options: FRAMEWORK_OPTIONS,
    groupBy: (o) => String(o.category),
  },
};

const AsyncMultiSelect = () => {
  const [selected, setSelected] = useState<MultiSelectOption[]>([]);

  const loadOptions = async (query: string): Promise<MultiSelectOption[]> => {
    await new Promise((r) => setTimeout(r, 500));
    return FRAMEWORK_OPTIONS.filter((o) =>
      o.label.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <MultiSelect
      label="Async search"
      loadOptions={loadOptions}
      value={selected}
      onChange={setSelected}
      placeholder="Type to search…"
      helperText="Options loaded asynchronously with 500ms delay"
    />
  );
};

export const Async: Story = {
  render: () => <AsyncMultiSelect />,
};

export const ValidationStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <MultiSelect label="Default" options={FRAMEWORK_OPTIONS} />
      <MultiSelect
        label="Error"
        options={FRAMEWORK_OPTIONS}
        validationState="error"
        errorMessage="Please select at least one framework"
      />
      <MultiSelect
        label="Success"
        options={FRAMEWORK_OPTIONS}
        validationState="success"
        successMessage="Great selection!"
        defaultValue={[FRAMEWORK_OPTIONS[0]]}
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <MultiSelect label="Small" options={FRAMEWORK_OPTIONS} size="sm" />
      <MultiSelect label="Medium" options={FRAMEWORK_OPTIONS} size="md" />
      <MultiSelect label="Large" options={FRAMEWORK_OPTIONS} size="lg" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    options: FRAMEWORK_OPTIONS,
    defaultValue: [FRAMEWORK_OPTIONS[0]],
    disabled: true,
  },
};
