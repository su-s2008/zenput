import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Navigation/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  argTypes: {
    separator: { control: 'text' },
    'aria-label': { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Widget Pro' },
    ],
  },
};

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Dashboard' }],
  },
};

export const TwoItems: Story = {
  args: {
    items: [{ label: 'Home', href: '/' }, { label: 'Settings' }],
  },
};

export const CustomSeparator: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Blog', href: '/blog' },
      { label: 'Understanding Breadcrumbs' },
    ],
    separator: '›',
  },
};

export const ChevronSeparator: Story = {
  render: () => (
    <Breadcrumbs
      items={[
        { label: 'Home', href: '/' },
        { label: 'Library', href: '/library' },
        { label: 'Components', href: '/library/components' },
        { label: 'Breadcrumbs' },
      ]}
      separator={
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      }
    />
  ),
};

export const ManyLevels: Story = {
  render: () => (
    <Breadcrumbs
      items={[
        { label: 'Root', href: '/' },
        { label: 'Level 1', href: '/l1' },
        { label: 'Level 2', href: '/l1/l2' },
        { label: 'Level 3', href: '/l1/l2/l3' },
        { label: 'Current Page' },
      ]}
    />
  ),
};

export const RTL: Story = {
  name: 'RTL — Arabic breadcrumbs',
  globals: { direction: 'rtl' },
  render: () => (
    <Breadcrumbs
      items={[
        { label: 'الرئيسية', href: '/' },
        { label: 'المنتجات', href: '/products' },
        { label: 'ويدجت برو' },
      ]}
      separator="‹"
      aria-label="مسار التنقل"
    />
  ),
};
