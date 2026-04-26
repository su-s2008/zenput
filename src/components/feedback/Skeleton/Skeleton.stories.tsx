import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton, SkeletonText, SkeletonAvatar } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'rect', 'circle'] },
    animation: { control: 'select', options: ['shimmer', 'pulse', 'none'] },
    width: { control: 'text' },
    height: { control: 'text' },
    loading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: { width: 300, height: 20 },
};

export const Shimmer: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 300 }}>
      <Skeleton height={20} animation="shimmer" />
      <Skeleton height={20} width="80%" animation="shimmer" />
      <Skeleton height={20} width="60%" animation="shimmer" />
    </div>
  ),
};

export const Pulse: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 300 }}>
      <Skeleton height={20} animation="pulse" />
      <Skeleton height={20} width="80%" animation="pulse" />
      <Skeleton height={20} width="60%" animation="pulse" />
    </div>
  ),
};

export const Circle: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Skeleton variant="circle" width={32} height={32} />
      <Skeleton variant="circle" width={40} height={40} />
      <Skeleton variant="circle" width={56} height={56} />
    </div>
  ),
};

export const CardPlaceholder: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: 320,
        padding: 16,
        border: '1px solid #e5e7eb',
        borderRadius: 8,
      }}
    >
      <Skeleton height={160} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <SkeletonAvatar size={40} />
        <div style={{ flex: 1 }}>
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  ),
};

export const TextLines: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <SkeletonText lines={4} />
    </div>
  ),
};

export const AvatarShortcut: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <SkeletonAvatar size={32} />
      <SkeletonAvatar size={40} />
      <SkeletonAvatar size={56} />
      <SkeletonAvatar size={72} />
    </div>
  ),
};

export const LoadingToggle: Story = {
  render: () => {
    function LoadingToggleDemo() {
      const [loading, setLoading] = React.useState(true);
      return (
        <div>
          <button onClick={() => setLoading((v) => !v)} style={{ marginBottom: 12 }}>
            Toggle loading
          </button>
          <Skeleton loading={loading} width={200} height={20}>
            <span>Loaded content 🎉</span>
          </Skeleton>
        </div>
      );
    }
    return <LoadingToggleDemo />;
  },
};
