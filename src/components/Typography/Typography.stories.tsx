import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';
import { Heading } from './Heading';
import { Link } from './Link';
import { Code } from './Code';
import { Kbd } from './Kbd';

const meta: Meta = {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Headings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Heading level={1}>Heading 1</Heading>
      <Heading level={2}>Heading 2</Heading>
      <Heading level={3}>Heading 3</Heading>
      <Heading level={4}>Heading 4</Heading>
      <Heading level={5}>Heading 5</Heading>
      <Heading level={6}>Heading 6</Heading>
    </div>
  ),
};

export const TextSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((s) => (
        <Text key={s} size={s}>
          Size {s} — The quick brown fox
        </Text>
      ))}
    </div>
  ),
};

export const TextTones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <Text tone="neutral">neutral</Text>
      <Text tone="secondary">secondary</Text>
      <Text tone="brand">brand</Text>
      <Text tone="success">success</Text>
      <Text tone="warning">warning</Text>
      <Text tone="danger">danger</Text>
      <Text tone="info">info</Text>
      <Text tone="disabled">disabled</Text>
    </div>
  ),
};

export const TextWeights: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <Text weight="regular">regular — 400</Text>
      <Text weight="medium">medium — 500</Text>
      <Text weight="semibold">semibold — 600</Text>
      <Text weight="bold">bold — 700</Text>
    </div>
  ),
};

export const Links: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Link href="#">Internal link</Link>
      <Link href="https://example.com" external>
        External link
      </Link>
    </div>
  ),
};

export const InlineCodeAndKbd: Story = {
  render: () => (
    <Text as="p">
      Press <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd> to run the <Code>search()</Code>{' '}
      command.
    </Text>
  ),
};

export const Truncate: Story = {
  render: () => (
    <div style={{ width: 240, border: '1px dashed #ccc', padding: 8 }}>
      <Text truncate>
        This is a very long line of text that will be truncated with an ellipsis
        when it overflows its container.
      </Text>
    </div>
  ),
};
