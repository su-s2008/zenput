import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
} from './Menu';

const meta: Meta<typeof Menu> = {
  title: 'Components/Overlay/Menu',
  component: Menu,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Menu>;

export const KebabMenu: Story = {
  render: () => (
    <Menu>
      <MenuTrigger>⋯ Options</MenuTrigger>
      <MenuContent aria-label="Options">
        <MenuItem>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <MenuSeparator />
        <MenuItem destructive>Delete</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const UserMenu: Story = {
  render: () => (
    <Menu>
      <MenuTrigger>👤 User</MenuTrigger>
      <MenuContent aria-label="User menu">
        <MenuLabel>Signed in as</MenuLabel>
        <MenuItem>Profile</MenuItem>
        <MenuItem>Settings</MenuItem>
        <MenuSeparator />
        <MenuItem>Sign out</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

function SortMenuExample() {
  const [sort, setSort] = useState('name');
  return (
    <Menu>
      <MenuTrigger>Sort by: {sort}</MenuTrigger>
      <MenuContent aria-label="Sort options">
        <MenuRadioGroup value={sort} onValueChange={setSort}>
          <MenuRadioItem value="name">Name</MenuRadioItem>
          <MenuRadioItem value="date">Date</MenuRadioItem>
          <MenuRadioItem value="size">Size</MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}

export const SortMenu: Story = {
  render: () => <SortMenuExample />,
};

export const NestedSubmenus: Story = {
  render: () => (
    <Menu>
      <MenuTrigger>File</MenuTrigger>
      <MenuContent aria-label="File menu">
        <MenuItem>New File</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Open Recent</MenuSubTrigger>
          <MenuSubContent aria-label="Recent files">
            <MenuItem>document.txt</MenuItem>
            <MenuItem>notes.md</MenuItem>
            <MenuItem>report.pdf</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSeparator />
        <MenuItem>Save</MenuItem>
        <MenuItem>Save As…</MenuItem>
      </MenuContent>
    </Menu>
  ),
};
