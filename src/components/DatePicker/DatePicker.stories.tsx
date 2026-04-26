import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['outlined', 'filled', 'underlined'] },
    validationState: { control: 'select', options: ['default', 'error', 'success', 'warning'] },
    locale: { control: 'text' },
    clearable: { control: 'boolean' },
    weekStartsOn: { control: 'select', options: [0, 1, 2, 3, 4, 5, 6] },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {
    label: 'Appointment date',
    placeholder: 'Select a date…',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Birthday',
    value: new Date(1990, 5, 15),
    locale: 'en-US',
  },
};

export const Clearable: Story = {
  args: {
    label: 'Event date',
    value: new Date(2024, 0, 15),
    clearable: true,
  },
};

export const WithPresets: Story = {
  args: {
    label: 'Date',
    presets: [
      { label: 'Today', date: new Date() },
      { label: 'In 7 days', date: new Date(Date.now() + 7 * 86400000) },
      { label: 'In 30 days', date: new Date(Date.now() + 30 * 86400000) },
    ],
  },
};

export const FrenchLocale: Story = {
  args: {
    label: 'Date de rendez-vous',
    locale: 'fr-FR',
    weekStartsOn: 1,
    format: { dateStyle: 'long' },
  },
};

export const MinMax: Story = {
  args: {
    label: 'Date',
    min: new Date(2024, 0, 5),
    max: new Date(2024, 0, 25),
    value: new Date(2024, 0, 15),
  },
};

export const DisabledWeekends: Story = {
  args: {
    label: 'Weekday only',
    disabledDates: (d: Date) => d.getDay() === 0 || d.getDay() === 6,
  },
};

export const WithError: Story = {
  args: {
    label: 'Start date',
    validationState: 'error',
    errorMessage: 'Start date is required',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Date (disabled)',
    value: new Date(2024, 0, 15),
    disabled: true,
  },
};

export const Controlled: Story = {
  render: () => {
    function ControlledDatePicker() {
      const [value, setValue] = useState<Date | null>(null);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <DatePicker
            label="Controlled date"
            value={value}
            onChange={setValue}
            clearable
          />
          <p style={{ fontSize: 14 }}>
            Value: {value ? value.toLocaleDateString() : 'none'}
          </p>
        </div>
      );
    }
    return <ControlledDatePicker />;
  },
};
