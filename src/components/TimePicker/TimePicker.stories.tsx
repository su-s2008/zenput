import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TimePicker } from './TimePicker';
import { TimeValue } from './TimePicker.types';

const meta: Meta<typeof TimePicker> = {
  title: 'Components/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['outlined', 'filled', 'underlined'] },
    validationState: { control: 'select', options: ['default', 'error', 'success', 'warning'] },
    hourCycle: { control: 'select', options: [12, 24] },
    minuteStep: { control: 'select', options: [1, 5, 10, 15, 30] },
    showSeconds: { control: 'boolean' },
    clearable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
  args: {
    label: 'Meeting time',
    placeholder: 'Select a time…',
  },
};

export const TwelveHour: Story = {
  args: {
    label: 'Start time',
    hourCycle: 12,
    value: { hours: 14, minutes: 30 },
  },
};

export const WithSeconds: Story = {
  args: {
    label: 'Duration',
    showSeconds: true,
    value: { hours: 1, minutes: 30, seconds: 0 },
  },
};

export const StepFifteenMinutes: Story = {
  args: {
    label: 'Appointment',
    minuteStep: 15,
  },
};

export const WithMinMax: Story = {
  args: {
    label: 'Office hours',
    min: { hours: 9, minutes: 0 },
    max: { hours: 17, minutes: 0 },
  },
};

export const Clearable: Story = {
  args: {
    label: 'Start time',
    value: { hours: 9, minutes: 0 },
    clearable: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Start time',
    validationState: 'error',
    errorMessage: 'Start time is required',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Start time (disabled)',
    value: { hours: 9, minutes: 0 },
    disabled: true,
  },
};

export const Controlled: Story = {
  render: () => {
    function ControlledTimePicker() {
      const [value, setValue] = useState<TimeValue | null>(null);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <TimePicker
            label="Controlled time"
            value={value}
            onChange={setValue}
            clearable
            hourCycle={12}
          />
          <p style={{ fontSize: 14 }}>
            Value:{' '}
            {value
              ? `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}`
              : 'none'}
          </p>
        </div>
      );
    }
    return <ControlledTimePicker />;
  },
};
