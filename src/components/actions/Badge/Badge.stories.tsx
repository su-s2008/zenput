import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Actions/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info'],
    },
    variant: { control: 'select', options: ['solid', 'subtle', 'outline'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: 'New' } };

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Badge tone="neutral">neutral</Badge>
      <Badge tone="brand">brand</Badge>
      <Badge tone="success">success</Badge>
      <Badge tone="warning">warning</Badge>
      <Badge tone="danger">danger</Badge>
      <Badge tone="info">info</Badge>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Badge variant="solid" tone="brand">
        solid
      </Badge>
      <Badge variant="subtle" tone="brand">
        subtle
      </Badge>
      <Badge variant="outline" tone="brand">
        outline
      </Badge>
    </div>
  ),
};

export const Counts: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Badge count={3} tone="danger" variant="solid" />
      <Badge count={42} tone="brand" variant="solid" />
      <Badge count={250} max={99} tone="danger" variant="solid" />
    </div>
  ),
};

export const Dot: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Badge dot tone="success" />
      <Badge dot tone="warning" />
      <Badge dot tone="danger" />
      <Badge dot tone="info" size="lg" />
    </div>
  ),
};
