import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DateRange } from './DateRangePicker.types';
import { DateRangePicker as DateRangePickerComponent } from './DateRangePicker';

const meta: Meta<typeof DateRangePickerComponent> = {
  title: 'Components/DateRangePicker',
  component: DateRangePickerComponent,
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
type Story = StoryObj<typeof DateRangePickerComponent>;

export const Default: Story = {
  args: {
    label: 'Date range',
    placeholder: 'Select date range…',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Trip dates',
    value: {
      start: new Date(2024, 0, 10),
      end: new Date(2024, 0, 20),
    },
    locale: 'en-US',
  },
};

export const Clearable: Story = {
  args: {
    label: 'Report period',
    value: {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 31),
    },
    clearable: true,
  },
};

export const WithPresets: Story = {
  args: {
    label: 'Date range',
    presets: [
      {
        label: 'Last 7 days',
        range: {
          start: new Date(Date.now() - 6 * 86400000),
          end: new Date(),
        },
      },
      {
        label: 'Last 30 days',
        range: {
          start: new Date(Date.now() - 29 * 86400000),
          end: new Date(),
        },
      },
      {
        label: 'This month',
        range: (() => {
          const now = new Date();
          return {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          };
        })(),
      },
    ],
  },
};

export const FrenchLocale: Story = {
  args: {
    label: 'Période',
    locale: 'fr-FR',
    weekStartsOn: 1,
    format: { dateStyle: 'long' },
  },
};

export const WithError: Story = {
  args: {
    label: 'Date range',
    validationState: 'error',
    errorMessage: 'Date range is required',
  },
};

export const Controlled: Story = {
  render: () => {
    function ControlledDateRangePicker() {
      const [range, setRange] = useState<DateRange>({ start: null, end: null });
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <DateRangePickerComponent
            label="Controlled range"
            value={range}
            onChange={setRange}
            clearable
            presets={[
              {
                label: 'Last 7 days',
                range: {
                  start: new Date(Date.now() - 6 * 86400000),
                  end: new Date(),
                },
              },
            ]}
          />
          <p style={{ fontSize: 14 }}>
            Start: {range.start?.toLocaleDateString() ?? 'none'} |
            End: {range.end?.toLocaleDateString() ?? 'none'}
          </p>
        </div>
      );
    }
    return <ControlledDateRangePicker />;
  },
};
