import { useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from 'zenput';
import { Section, Scenario } from './_shell';

export function AccordionSection() {
  const [controlled, setControlled] = useState<string[]>(['item1']);

  return (
    <Section
      id="accordion"
      name="Accordion"
      description="Expandable content sections — single or multiple open panels, controlled and uncontrolled."
    >
      <Scenario title="Single (uncontrolled)">
        <Accordion defaultValue="faq1">
          <AccordionItem value="faq1">
            <AccordionTrigger>What is Zenput?</AccordionTrigger>
            <AccordionContent>
              Zenput is a design-system component library for React, built with accessible, composable
              primitives and a powerful token-based theming engine.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq2">
            <AccordionTrigger>How do I install it?</AccordionTrigger>
            <AccordionContent>
              Run <code>npm install zenput</code>, then wrap your application in{' '}
              <code>&lt;ThemeProvider&gt;</code>.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq3">
            <AccordionTrigger>Does it support dark mode?</AccordionTrigger>
            <AccordionContent>
              Yes — pass <code>mode="dark"</code> or <code>mode="system"</code> to ThemeProvider
              to switch to dark or system-preference mode automatically.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Scenario>

      <Scenario title="Multiple open panels">
        <Accordion multiple defaultValue={['panel-a', 'panel-c']}>
          <AccordionItem value="panel-a">
            <AccordionTrigger>Panel A (starts open)</AccordionTrigger>
            <AccordionContent>
              This panel starts open. Multiple panels can be expanded simultaneously.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="panel-b">
            <AccordionTrigger>Panel B</AccordionTrigger>
            <AccordionContent>Click to expand and collapse this panel independently.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="panel-c">
            <AccordionTrigger>Panel C (starts open)</AccordionTrigger>
            <AccordionContent>
              Panel A and C start open because <code>defaultValue</code> is an array.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Scenario>

      <Scenario title="Controlled">
        <div>
          <div className="row" style={{ marginBottom: '12px' }}>
            <button type="button" onClick={() => setControlled(['item1'])}>
              Open item 1
            </button>
            <button type="button" onClick={() => setControlled(['item1', 'item2'])}>
              Open 1 &amp; 2
            </button>
            <button type="button" onClick={() => setControlled([])}>
              Close all
            </button>
          </div>
          <Accordion
            multiple
            value={controlled}
            onChange={(v) => setControlled(Array.isArray(v) ? v : [v])}
          >
            <AccordionItem value="item1">
              <AccordionTrigger>Item 1</AccordionTrigger>
              <AccordionContent>Controlled item 1 content.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item2">
              <AccordionTrigger>Item 2</AccordionTrigger>
              <AccordionContent>Controlled item 2 content.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item3">
              <AccordionTrigger>Item 3</AccordionTrigger>
              <AccordionContent>Controlled item 3 content.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Scenario>

      <Scenario title="With disabled item">
        <Accordion defaultValue="enabled">
          <AccordionItem value="enabled">
            <AccordionTrigger>Enabled item</AccordionTrigger>
            <AccordionContent>This item can be toggled normally.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="locked" disabled>
            <AccordionTrigger>Disabled item</AccordionTrigger>
            <AccordionContent>This panel cannot be reached.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="other">
            <AccordionTrigger>Another enabled item</AccordionTrigger>
            <AccordionContent>Another normally-toggled item.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Scenario>
    </Section>
  );
}
