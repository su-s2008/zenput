import { useState } from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'zenput';
import { Section, Scenario } from './_shell';

export function TabsSection() {
  const [controlled, setControlled] = useState('tab1');

  return (
    <Section
      id="tabs"
      name="Tabs"
      description="Accessible tab navigation — manual and automatic activation, horizontal and vertical orientation."
    >
      <Scenario title="Default (uncontrolled, horizontal)">
        <Tabs defaultValue="overview">
          <TabList>
            <Tab value="overview">Overview</Tab>
            <Tab value="specs">Specifications</Tab>
            <Tab value="reviews">Reviews</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="overview">
              <p>Product overview content goes here.</p>
            </TabPanel>
            <TabPanel value="specs">
              <p>Technical specifications go here.</p>
            </TabPanel>
            <TabPanel value="reviews">
              <p>Customer reviews appear here.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Scenario>

      <Scenario title="Controlled">
        <div>
          <div className="row" style={{ marginBottom: '8px' }}>
            <button type="button" onClick={() => setControlled('tab1')}>
              Select Tab 1
            </button>
            <button type="button" onClick={() => setControlled('tab2')}>
              Select Tab 2
            </button>
            <button type="button" onClick={() => setControlled('tab3')}>
              Select Tab 3
            </button>
          </div>
          <p style={{ marginBottom: '8px', fontSize: '0.85em', color: 'var(--zp-color-text-muted)' }}>
            Active: <strong>{controlled}</strong>
          </p>
          <Tabs value={controlled} onChange={setControlled}>
            <TabList>
              <Tab value="tab1">Tab 1</Tab>
              <Tab value="tab2">Tab 2</Tab>
              <Tab value="tab3">Tab 3</Tab>
            </TabList>
            <TabPanels>
              <TabPanel value="tab1">Content for Tab 1</TabPanel>
              <TabPanel value="tab2">Content for Tab 2</TabPanel>
              <TabPanel value="tab3">Content for Tab 3</TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </Scenario>

      <Scenario title="Vertical orientation">
        <Tabs defaultValue="profile" orientation="vertical">
          <TabList>
            <Tab value="profile">Profile</Tab>
            <Tab value="account">Account</Tab>
            <Tab value="notifications">Notifications</Tab>
            <Tab value="security">Security</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="profile">Manage your public profile information.</TabPanel>
            <TabPanel value="account">Update your account settings and preferences.</TabPanel>
            <TabPanel value="notifications">Configure notification preferences.</TabPanel>
            <TabPanel value="security">Change password and manage 2FA.</TabPanel>
          </TabPanels>
        </Tabs>
      </Scenario>

      <Scenario title="With disabled tab">
        <Tabs defaultValue="active">
          <TabList>
            <Tab value="active">Active</Tab>
            <Tab value="disabled" disabled>
              Disabled
            </Tab>
            <Tab value="another">Another</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="active">Active tab content.</TabPanel>
            <TabPanel value="disabled">This panel is unreachable.</TabPanel>
            <TabPanel value="another">Another tab content.</TabPanel>
          </TabPanels>
        </Tabs>
      </Scenario>
    </Section>
  );
}
