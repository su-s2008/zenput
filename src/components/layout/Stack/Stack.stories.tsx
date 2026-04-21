import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack, HStack, VStack } from './Stack';
import { Box } from '../Box/Box';

const meta: Meta<typeof Stack> = {
  title: 'Components/Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Stack>;

const Item: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box p="3" bg="brand-subtle" radius="md">
    {children}
  </Box>
);

export const Default: Story = {
  render: () => (
    <Stack gap="3">
      <Item>One</Item>
      <Item>Two</Item>
      <Item>Three</Item>
    </Stack>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <HStack gap="4" align="center">
      <Item>One</Item>
      <Item>Two</Item>
      <Item>Three</Item>
    </HStack>
  ),
};

export const Vertical: Story = {
  render: () => (
    <VStack gap="2">
      <Item>A</Item>
      <Item>B</Item>
      <Item>C</Item>
    </VStack>
  ),
};

export const Justify: Story = {
  render: () => (
    <HStack gap="2" justify="between" fullWidth>
      <Item>Start</Item>
      <Item>Middle</Item>
      <Item>End</Item>
    </HStack>
  ),
};
