import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  SegmentedControl,
  SegmentedControlItem,
  ToggleGroup,
  ToggleGroupItem,
} from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/Actions/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

function DefaultExample() {
  const [v, setV] = useState('day');
  return (
    <SegmentedControl value={v} onChange={setV} aria-label="Time period">
      <SegmentedControlItem value="day">Day</SegmentedControlItem>
      <SegmentedControlItem value="week">Week</SegmentedControlItem>
      <SegmentedControlItem value="month">Month</SegmentedControlItem>
    </SegmentedControl>
  );
}

export const Default: Story = {
  render: () => <DefaultExample />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <SegmentedControl key={size} defaultValue="a" size={size} aria-label={`Size ${size}`}>
          <SegmentedControlItem value="a">Option A</SegmentedControlItem>
          <SegmentedControlItem value="b">Option B</SegmentedControlItem>
          <SegmentedControlItem value="c">Option C</SegmentedControlItem>
        </SegmentedControl>
      ))}
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <SegmentedControl defaultValue="day" fullWidth aria-label="Period">
      <SegmentedControlItem value="day">Day</SegmentedControlItem>
      <SegmentedControlItem value="week">Week</SegmentedControlItem>
      <SegmentedControlItem value="month">Month</SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const WithDisabledItem: Story = {
  render: () => (
    <SegmentedControl defaultValue="a" aria-label="Options">
      <SegmentedControlItem value="a">Enabled</SegmentedControlItem>
      <SegmentedControlItem value="b" disabled>
        Disabled
      </SegmentedControlItem>
      <SegmentedControlItem value="c">Enabled</SegmentedControlItem>
    </SegmentedControl>
  ),
};

function ToggleGroupSingleExample() {
  const [v, setV] = useState('bold');
  return (
    <ToggleGroup type="single" value={v} onValueChange={setV} aria-label="Text formatting">
      <ToggleGroupItem value="bold">B</ToggleGroupItem>
      <ToggleGroupItem value="italic">I</ToggleGroupItem>
      <ToggleGroupItem value="underline">U</ToggleGroupItem>
    </ToggleGroup>
  );
}

export const ToggleGroupSingle: StoryObj = {
  render: () => <ToggleGroupSingleExample />,
};

function ToggleGroupMultipleExample() {
  const [v, setV] = useState<string[]>(['bold']);
  return (
    <ToggleGroup type="multiple" value={v} onValueChange={setV} aria-label="Text formatting">
      <ToggleGroupItem value="bold">B</ToggleGroupItem>
      <ToggleGroupItem value="italic">I</ToggleGroupItem>
      <ToggleGroupItem value="underline">U</ToggleGroupItem>
    </ToggleGroup>
  );
}

export const ToggleGroupMultiple: StoryObj = {
  render: () => <ToggleGroupMultipleExample />,
};
