import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Navigation/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  argTypes: {
    multiple: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion style={{ maxWidth: 560 }}>
      <AccordionItem value="item1">
        <AccordionTrigger>What is Zenput?</AccordionTrigger>
        <AccordionContent>
          Zenput is an accessible React component library built for design-system teams who need
          consistent, themeable UI primitives.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. All components follow WAI-ARIA authoring practices and are tested with axe for
          automated accessibility violations.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item3">
        <AccordionTrigger>Can I theme it?</AccordionTrigger>
        <AccordionContent>
          Absolutely. Use <code>ThemeProvider</code> with a custom theme object, or override
          individual CSS custom properties at any level of the DOM.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const MultipleOpen: Story = {
  render: () => (
    <Accordion multiple style={{ maxWidth: 560 }}>
      <AccordionItem value="item1">
        <AccordionTrigger>Section A</AccordionTrigger>
        <AccordionContent>Content for section A.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>Section B</AccordionTrigger>
        <AccordionContent>Content for section B.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item3">
        <AccordionTrigger>Section C</AccordionTrigger>
        <AccordionContent>Content for section C.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithDefaultOpen: Story = {
  render: () => (
    <Accordion defaultValue="item2" style={{ maxWidth: 560 }}>
      <AccordionItem value="item1">
        <AccordionTrigger>Collapsed by default</AccordionTrigger>
        <AccordionContent>This section starts collapsed.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>Open by default</AccordionTrigger>
        <AccordionContent>This section starts expanded.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithDisabledItem: Story = {
  render: () => (
    <Accordion style={{ maxWidth: 560 }}>
      <AccordionItem value="item1">
        <AccordionTrigger>Normal item</AccordionTrigger>
        <AccordionContent>You can expand this.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item2" disabled>
        <AccordionTrigger>Disabled item</AccordionTrigger>
        <AccordionContent>You cannot expand this.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item3">
        <AccordionTrigger>Another normal item</AccordionTrigger>
        <AccordionContent>You can also expand this.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Controlled: Story = {
  render: function ControlledDemo() {
    const [value, setValue] = useState<string>('');
    return (
      <div>
        <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Controlled — open: <strong>{value || '(none)'}</strong>
        </p>
        <Accordion value={value} onChange={(v) => setValue(v as string)} style={{ maxWidth: 560 }}>
          <AccordionItem value="item1">
            <AccordionTrigger>First</AccordionTrigger>
            <AccordionContent>First content.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item2">
            <AccordionTrigger>Second</AccordionTrigger>
            <AccordionContent>Second content.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  },
};
