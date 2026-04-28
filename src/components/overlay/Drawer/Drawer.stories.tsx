import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
} from './Drawer';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Overlay/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger>Open drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <p>Pick your filters here.</p>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
        <Drawer key={side}>
          <DrawerTrigger>{side}</DrawerTrigger>
          <DrawerContent side={side}>
            <DrawerHeader>
              <DrawerTitle>From the {side}</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>Slide-in panel from {side}.</DrawerBody>
            <DrawerFooter>
              <DrawerClose>Close</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  ),
};

export const RTL: Story = {
  name: 'RTL — right-to-left Drawer',
  globals: { direction: 'rtl' },
  render: () => (
    <Drawer>
      <DrawerTrigger>افتح الدرج</DrawerTrigger>
      <DrawerContent side="right">
        <DrawerHeader>
          <DrawerTitle>إعدادات الفلتر</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <p>يمكنك اختيار الفلاتر من هنا.</p>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose>تم</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
