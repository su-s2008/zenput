import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import * as Icons from './icons';

const meta: Meta<typeof Icon> = {
  title: 'Foundations/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'text' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  render: () => (
    <Icon size={24} label="Info">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </Icon>
  ),
};

export const BuiltInIcons: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.5rem',
        fontSize: '0.875rem',
      }}
    >
      {Object.entries(Icons).map(([name, IconComponent]) => {
        const Component = IconComponent as React.ComponentType<{ size?: number; label?: string }>;
        return (
          <div
            key={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Component size={28} label={name} />
            <code>{name}</code>
          </div>
        );
      })}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Icons.CheckIcon size={12} label="12" />
      <Icons.CheckIcon size={16} label="16" />
      <Icons.CheckIcon size={24} label="24" />
      <Icons.CheckIcon size={32} label="32" />
      <Icons.CheckIcon size={48} label="48" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <span style={{ color: 'var(--zp-color-brand)' }}>
        <Icons.InfoIcon size={28} label="brand" />
      </span>
      <span style={{ color: 'var(--zp-color-success)' }}>
        <Icons.SuccessIcon size={28} label="success" />
      </span>
      <span style={{ color: 'var(--zp-color-warning)' }}>
        <Icons.WarningIcon size={28} label="warning" />
      </span>
      <span style={{ color: 'var(--zp-color-danger)' }}>
        <Icons.ErrorIcon size={28} label="danger" />
      </span>
    </div>
  ),
};
