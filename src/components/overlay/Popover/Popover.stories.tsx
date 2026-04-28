import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';

const meta: Meta<typeof Popover> = {
  title: 'Components/Overlay/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <strong>Quick settings</strong>
          <label>
            <input type="checkbox" /> Sync automatically
          </label>
          <label>
            <input type="checkbox" /> Notify me
          </label>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, padding: 80 }}>
      {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger>{side}</PopoverTrigger>
          <PopoverContent side={side}>Placed on {side}</PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

export const RTL: Story = {
  name: 'RTL — right-to-left Popover',
  globals: { direction: 'rtl' },
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 80 }}>
      <Popover>
        <PopoverTrigger>افتح النافذة</PopoverTrigger>
        <PopoverContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <strong>الإعدادات السريعة</strong>
            <label>
              <input type="checkbox" /> المزامنة التلقائية
            </label>
            <label>
              <input type="checkbox" /> الإشعارات
            </label>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
