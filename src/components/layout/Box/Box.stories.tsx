import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from './Box';

const meta: Meta<typeof Box> = {
  title: 'Components/Layout/Box',
  component: Box,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Default: Story = {
  render: () => (
    <Box p="4" bg="brand-subtle" radius="md">
      A Box with padding, subtle background, and medium radius.
    </Box>
  ),
};

export const Elevation: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((s) => (
        <Box key={s} p="4" radius="md" bg="surface" shadow={s}>
          shadow {s}
        </Box>
      ))}
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <Box bg="brand-subtle" radius="md" p="6">
      <Box bg="surface" radius="sm" p="4" mb="4">
        Inner box with p=4 mb=4
      </Box>
      <Box bg="surface" radius="sm" px="6" py="2">
        px=6 py=2
      </Box>
    </Box>
  ),
};
