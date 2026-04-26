import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from './Calendar';

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  argTypes: {
    weekStartsOn: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6],
      description: '0=Sun, 1=Mon, …',
    },
    locale: { control: 'text' },
    showWeekNumbers: { control: 'boolean' },
    highlightToday: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  args: {
    value: new Date(2024, 0, 15),
    locale: 'en-US',
  },
};

export const WeekStartsMonday: Story = {
  args: {
    value: new Date(2024, 0, 15),
    weekStartsOn: 1,
  },
};

export const WithWeekNumbers: Story = {
  args: {
    value: new Date(2024, 0, 15),
    showWeekNumbers: true,
  },
};

export const FrenchLocale: Story = {
  args: {
    value: new Date(2024, 0, 15),
    locale: 'fr-FR',
    weekStartsOn: 1,
  },
};

export const JapaneseLocale: Story = {
  args: {
    value: new Date(2024, 0, 15),
    locale: 'ja-JP',
  },
};

export const WithMinMax: Story = {
  args: {
    value: new Date(2024, 0, 15),
    min: new Date(2024, 0, 5),
    max: new Date(2024, 0, 25),
  },
};

export const WithDisabledDates: Story = {
  args: {
    value: new Date(2024, 0, 15),
    disabledDates: (d: Date) => d.getDay() === 0 || d.getDay() === 6,
  },
  name: 'Disabled Weekends',
};

export const Controlled: Story = {
  render: () => {
    function ControlledCalendar() {
      const [date, setDate] = useState<Date | null>(new Date(2024, 0, 15));
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Calendar value={date ?? undefined} onChange={(d) => setDate(d)} />
          <p style={{ fontSize: 14 }}>
            Selected: {date ? date.toLocaleDateString() : 'none'}
          </p>
        </div>
      );
    }
    return <ControlledCalendar />;
  },
};
