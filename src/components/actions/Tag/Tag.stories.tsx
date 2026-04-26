import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from './Tag';

const meta: Meta<typeof Tag> = {
  title: 'Components/Actions/Tag',
  component: Tag,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['brand', 'neutral', 'success', 'warning', 'error', 'info'],
    },
    variant: { control: 'select', options: ['solid', 'subtle', 'outline'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = { args: { children: 'Tag', color: 'neutral' } };

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {(['brand', 'neutral', 'success', 'warning', 'error', 'info'] as const).map((color) => (
        <Tag key={color} color={color}>
          {color}
        </Tag>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Tag color="brand" variant="solid">
        Solid
      </Tag>
      <Tag color="brand" variant="subtle">
        Subtle
      </Tag>
      <Tag color="brand" variant="outline">
        Outline
      </Tag>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Tag size="sm">Small</Tag>
      <Tag size="md">Medium</Tag>
      <Tag size="lg">Large</Tag>
    </div>
  ),
};

export const Closable: Story = {
  render: () => (
    <Tag color="brand" onRemove={() => alert('removed')}>
      Closable
    </Tag>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Tag color="brand" leftIcon={<span>#</span>}>
      Design
    </Tag>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Tag color="neutral" interactive onClick={() => alert('clicked')}>
      Click me
    </Tag>
  ),
};
