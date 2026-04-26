import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

/* Simple SVG icons used in stories (no external dep needed) */
function InboxIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'radio', options: ['default', 'search', 'error'] },
    title: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  render: () => (
    <EmptyState
      icon={<InboxIcon />}
      title="No items yet"
      description="Create your first item to get started."
      primaryAction={{ label: 'Create item', onClick: () => alert('Create!') }}
    />
  ),
};

export const SearchVariant: Story = {
  render: () => (
    <EmptyState
      icon={<SearchIcon />}
      title="No results found"
      description="Try adjusting your search or filters."
      variant="search"
      primaryAction={{ label: 'Clear filters', onClick: () => undefined }}
      secondaryAction={{ label: 'Learn more', href: '#' }}
    />
  ),
};

export const ErrorVariant: Story = {
  render: () => (
    <EmptyState
      icon={<AlertIcon />}
      title="Something went wrong"
      description="We couldn't load your data. Please try again."
      variant="error"
      primaryAction={{ label: 'Retry', onClick: () => undefined }}
    />
  ),
};

export const SmallSize: Story = {
  render: () => (
    <EmptyState
      title="No results"
      description="Try a different filter."
      size="sm"
      primaryAction={{ label: 'Clear', onClick: () => undefined }}
    />
  ),
};

export const LargeSize: Story = {
  render: () => (
    <EmptyState
      icon={<InboxIcon />}
      title="Your inbox is empty"
      description="Messages and notifications will appear here."
      size="lg"
      primaryAction={{ label: 'Compose', onClick: () => undefined }}
      secondaryAction={{ label: 'Learn more', href: '#' }}
    />
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <EmptyState
      title="No data available"
      description="There is nothing to display at this time."
    />
  ),
};
