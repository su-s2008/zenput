import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CircularProgress } from './CircularProgress';

const meta: Meta<typeof CircularProgress> = {
  title: 'Components/Feedback/CircularProgress',
  component: CircularProgress,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    status: { control: 'select', options: ['default', 'success', 'warning', 'error'] },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    max: { control: 'number' },
    indeterminate: { control: 'boolean' },
    showValue: { control: 'boolean' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CircularProgress>;

export const Default: Story = {
  args: { value: 65, label: 'Upload', showValue: true },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <CircularProgress size="sm" value={70} aria-label="Small" />
      <CircularProgress size="md" value={70} aria-label="Medium" />
      <CircularProgress size="lg" value={70} aria-label="Large" />
    </div>
  ),
};

export const Statuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <CircularProgress value={80} status="default" showValue />
      <CircularProgress value={100} status="success" showValue />
      <CircularProgress value={60} status="warning" showValue />
      <CircularProgress value={30} status="error" showValue />
    </div>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <CircularProgress indeterminate aria-label="Loading" size="sm" />
      <CircularProgress indeterminate aria-label="Loading" size="md" />
      <CircularProgress indeterminate aria-label="Loading" size="lg" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <CircularProgress value={75} label="Upload" showValue />
      <CircularProgress value={45} label="Download" showValue />
    </div>
  ),
};
