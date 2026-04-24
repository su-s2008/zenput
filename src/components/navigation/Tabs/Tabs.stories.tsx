import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    value: { control: 'text' },
    defaultValue: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabList aria-label="Example tabs">
        <Tab value="tab1">Overview</Tab>
        <Tab value="tab2">Analytics</Tab>
        <Tab value="tab3">Settings</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="tab1">
          <p>Overview content — summary of activity.</p>
        </TabPanel>
        <TabPanel value="tab2">
          <p>Analytics content — charts and data.</p>
        </TabPanel>
        <TabPanel value="tab3">
          <p>Settings content — configuration options.</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="tab1" orientation="vertical" style={{ height: 200 }}>
      <TabList aria-label="Vertical tabs">
        <Tab value="tab1">Profile</Tab>
        <Tab value="tab2">Security</Tab>
        <Tab value="tab3">Notifications</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="tab1">Profile settings.</TabPanel>
        <TabPanel value="tab2">Security settings.</TabPanel>
        <TabPanel value="tab3">Notification preferences.</TabPanel>
      </TabPanels>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabList aria-label="Tabs with disabled">
        <Tab value="tab1">Active</Tab>
        <Tab value="tab2" disabled>
          Disabled
        </Tab>
        <Tab value="tab3">Another</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="tab1">First panel.</TabPanel>
        <TabPanel value="tab2">This panel is inaccessible.</TabPanel>
        <TabPanel value="tab3">Third panel.</TabPanel>
      </TabPanels>
    </Tabs>
  ),
};

export const Controlled: Story = {
  render: function ControlledDemo() {
    const [tab, setTab] = useState('tab1');
    return (
      <div>
        <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Controlled — current tab: <strong>{tab}</strong>
        </p>
        <Tabs value={tab} onChange={setTab}>
          <TabList aria-label="Controlled tabs">
            <Tab value="tab1">One</Tab>
            <Tab value="tab2">Two</Tab>
            <Tab value="tab3">Three</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">Panel one.</TabPanel>
            <TabPanel value="tab2">Panel two.</TabPanel>
            <TabPanel value="tab3">Panel three.</TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    );
  },
};
