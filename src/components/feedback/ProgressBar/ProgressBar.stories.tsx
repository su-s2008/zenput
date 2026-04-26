import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/Feedback/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    status: { control: 'select', options: ['default', 'success', 'warning', 'error'] },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    max: { control: 'number' },
    indeterminate: { control: 'boolean' },
    striped: { control: 'boolean' },
    showValue: { control: 'boolean' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: { value: 60, label: 'Upload progress', showValue: true },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 400 }}>
      <ProgressBar size="sm" value={70} label="Small" />
      <ProgressBar size="md" value={70} label="Medium" />
      <ProgressBar size="lg" value={70} label="Large" />
    </div>
  ),
};

export const Statuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 400 }}>
      <ProgressBar value={80} status="default" label="Default" showValue />
      <ProgressBar value={100} status="success" label="Success" showValue />
      <ProgressBar value={60} status="warning" label="Warning" showValue />
      <ProgressBar value={30} status="error" label="Error" showValue />
    </div>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <ProgressBar indeterminate label="Loading…" />
    </div>
  ),
};

export const Striped: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 400 }}>
      <ProgressBar value={65} striped label="Striped" size="lg" showValue />
    </div>
  ),
};
