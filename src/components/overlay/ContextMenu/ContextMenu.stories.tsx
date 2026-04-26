import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent } from './ContextMenu';
import { MenuItem, MenuSeparator } from '../Menu/Menu';

const meta: Meta<typeof ContextMenu> = {
  title: 'Components/Overlay/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const ListContextMenu: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          style={{
            width: 300,
            height: 200,
            border: '2px dashed #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            userSelect: 'none',
          }}
        >
          Right-click anywhere here
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="Context actions">
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
        <MenuSeparator />
        <MenuItem destructive>Delete</MenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
