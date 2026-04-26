import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarGroup } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Actions/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    shape: { control: 'select', options: ['circle', 'square'] },
    status: { control: 'select', options: ['online', 'offline', 'away', 'busy'] },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: { name: 'Ada Lovelace', size: 'md', shape: 'circle' },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    name: 'Ada Lovelace',
    size: 'md',
  },
};

export const ColorByName: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      {['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Linus Torvalds', 'Margaret Hamilton'].map(
        (name) => (
          <Avatar key={name} name={name} colorByName />
        )
      )}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
        <Avatar key={size} name="Ada Lovelace" size={size} colorByName />
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Avatar name="Ada Lovelace" shape="circle" colorByName />
      <Avatar name="Ada Lovelace" shape="square" colorByName />
    </div>
  ),
};

export const Statuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Avatar name="Online" colorByName status="online" />
      <Avatar name="Offline" colorByName status="offline" />
      <Avatar name="Away" colorByName status="away" />
      <Avatar name="Busy" colorByName status="busy" />
    </div>
  ),
};

export const Group: StoryObj<typeof AvatarGroup> = {
  render: () => (
    <AvatarGroup max={4} size="md">
      {[
        'Ada Lovelace',
        'Grace Hopper',
        'Alan Turing',
        'Linus Torvalds',
        'Margaret Hamilton',
        'Tim Berners-Lee',
      ].map((name) => (
        <Avatar key={name} name={name} colorByName />
      ))}
    </AvatarGroup>
  ),
};
