import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Feedback/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    label: { control: 'text' },
    thickness: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
};

export const CustomColor: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner style={{ color: 'var(--zp-color-brand)' }} />
      <Spinner style={{ color: 'var(--zp-color-success)' }} />
      <Spinner style={{ color: 'var(--zp-color-danger)' }} />
    </div>
  ),
};

export const CustomThickness: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner size="xl" thickness="2px" />
      <Spinner size="xl" thickness="6px" />
    </div>
  ),
};

export const SilentSpinner: Story = {
  name: 'Silent (label="")',
  render: () => <Spinner label="" />,
};
