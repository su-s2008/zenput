import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';
import { expectNoA11yViolations } from '../../../test-utils/axe';

function BasicAccordion({ multiple = false }: { multiple?: boolean }) {
  return (
    <Accordion multiple={multiple}>
      <AccordionItem value="item1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>Content 1</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>Content 2</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item3" disabled>
        <AccordionTrigger>Section 3</AccordionTrigger>
        <AccordionContent>Content 3</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe('Accordion', () => {
  it('renders without crashing', () => {
    const { container } = render(<BasicAccordion />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('all items are collapsed by default', () => {
    render(<BasicAccordion />);
    expect(screen.queryByText('Content 1')).not.toBeVisible();
    expect(screen.queryByText('Content 2')).not.toBeVisible();
  });

  it('expands an item on trigger click', async () => {
    render(<BasicAccordion />);
    await userEvent.click(screen.getByRole('button', { name: 'Section 1' }));
    expect(screen.getByText('Content 1')).toBeVisible();
  });

  it('collapses an open item when clicked again', async () => {
    render(<BasicAccordion />);
    await userEvent.click(screen.getByRole('button', { name: 'Section 1' }));
    expect(screen.getByText('Content 1')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Section 1' }));
    expect(screen.queryByText('Content 1')).not.toBeVisible();
  });

  it('closes previous item when another opens (single mode)', async () => {
    render(<BasicAccordion />);
    await userEvent.click(screen.getByRole('button', { name: 'Section 1' }));
    expect(screen.getByText('Content 1')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Section 2' }));
    expect(screen.queryByText('Content 1')).not.toBeVisible();
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('allows multiple items open simultaneously when multiple=true', async () => {
    render(<BasicAccordion multiple />);
    await userEvent.click(screen.getByRole('button', { name: 'Section 1' }));
    await userEvent.click(screen.getByRole('button', { name: 'Section 2' }));
    expect(screen.getByText('Content 1')).toBeVisible();
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('sets aria-expanded correctly', async () => {
    render(<BasicAccordion />);
    const btn = screen.getByRole('button', { name: 'Section 1' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('disabled item cannot be toggled', async () => {
    render(<BasicAccordion />);
    const btn = screen.getByRole('button', { name: 'Section 3' });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(screen.queryByText('Content 3')).not.toBeVisible();
  });

  it('supports defaultValue (uncontrolled)', () => {
    render(
      <Accordion defaultValue="item1">
        <AccordionItem value="item1">
          <AccordionTrigger>S1</AccordionTrigger>
          <AccordionContent>C1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('C1')).toBeVisible();
  });

  it('works in controlled mode', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Accordion value="item1" onChange={onChange}>
        <AccordionItem value="item1">
          <AccordionTrigger>S1</AccordionTrigger>
          <AccordionContent>C1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>S2</AccordionTrigger>
          <AccordionContent>C2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('C1')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'S2' }));
    expect(onChange).toHaveBeenCalled();
    // value prop still 'item1' so C1 stays visible
    expect(screen.getByText('C1')).toBeVisible();
    rerender(
      <Accordion value="item2" onChange={onChange}>
        <AccordionItem value="item1">
          <AccordionTrigger>S1</AccordionTrigger>
          <AccordionContent>C1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>S2</AccordionTrigger>
          <AccordionContent>C2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('C2')).toBeVisible();
  });

  it('trigger is linked to content via aria-controls', async () => {
    render(<BasicAccordion />);
    await userEvent.click(screen.getByRole('button', { name: 'Section 1' }));
    const btn = screen.getByRole('button', { name: 'Section 1' });
    const contentId = btn.getAttribute('aria-controls');
    expect(contentId).toBeTruthy();
    expect(document.getElementById(contentId!)).not.toBeNull();
  });

  it('throws when AccordionTrigger used outside Accordion', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <AccordionItem value="x">
          <AccordionTrigger>T</AccordionTrigger>
        </AccordionItem>
      )
    ).toThrow();
    spy.mockRestore();
  });
});

describe('Accordion a11y (axe)', () => {
  it('has no detectable axe violations', async () => {
    const { container } = render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    await expectNoA11yViolations(container);
  });
});
