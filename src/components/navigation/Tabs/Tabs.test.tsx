import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from './Tabs';
import { expectNoA11yViolations } from '../../../test-utils/axe';

function BasicTabs() {
  return (
    <Tabs defaultValue="tab1">
      <TabList>
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2">Tab 2</Tab>
        <Tab value="tab3" disabled>
          Tab 3
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
        <TabPanel value="tab3">Content 3</TabPanel>
      </TabPanels>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('renders without crashing', () => {
    const { container } = render(<BasicTabs />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('shows the first panel by default', () => {
    render(<BasicTabs />);
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('switches panel on tab click', async () => {
    render(<BasicTabs />);
    await userEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('sets aria-selected correctly', async () => {
    render(<BasicTabs />);
    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab2).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(tab2);
    expect(tab1).toHaveAttribute('aria-selected', 'false');
    expect(tab2).toHaveAttribute('aria-selected', 'true');
  });

  it('renders a tablist with aria-orientation=horizontal by default', () => {
    render(<BasicTabs />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('supports vertical orientation', () => {
    render(
      <Tabs defaultValue="a" orientation="vertical">
        <TabList>
          <Tab value="a">A</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="a">Panel A</TabPanel>
        </TabPanels>
      </Tabs>
    );
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('disabled tab cannot be clicked', async () => {
    render(<BasicTabs />);
    const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
    expect(tab3).toBeDisabled();
    await userEvent.click(tab3);
    // panel 3 still not shown
    expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
  });

  it('navigates tabs with ArrowRight key', () => {
    render(<BasicTabs />);
    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    tab1.focus();
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('wraps around with ArrowLeft from first tab', () => {
    render(<BasicTabs />);
    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    tab1.focus();
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' });
    // wraps to last enabled (Tab 2 since Tab 3 disabled)
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('goes to first tab on Home key', async () => {
    render(<BasicTabs />);
    await userEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'Home' });
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('goes to last enabled tab on End key', () => {
    render(<BasicTabs />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'End' });
    // Tab 3 is disabled, so End should go to Tab 2
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('works in controlled mode', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Tabs value="tab1" onChange={onChange}>
        <TabList>
          <Tab value="tab1">T1</Tab>
          <Tab value="tab2">T2</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="tab1">P1</TabPanel>
          <TabPanel value="tab2">P2</TabPanel>
        </TabPanels>
      </Tabs>
    );
    expect(screen.getByText('P1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'T2' }));
    expect(onChange).toHaveBeenCalledWith('tab2');
    // stays on P1 because value prop hasn't changed
    expect(screen.getByText('P1')).toBeInTheDocument();

    rerender(
      <Tabs value="tab2" onChange={onChange}>
        <TabList>
          <Tab value="tab1">T1</Tab>
          <Tab value="tab2">T2</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="tab1">P1</TabPanel>
          <TabPanel value="tab2">P2</TabPanel>
        </TabPanels>
      </Tabs>
    );
    expect(screen.getByText('P2')).toBeInTheDocument();
  });

  it('links tab to panel with aria-controls / aria-labelledby', () => {
    render(<BasicTabs />);
    const tab = screen.getByRole('tab', { name: 'Tab 1' });
    const panel = screen.getByRole('tabpanel');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });

  it('throws when Tab is used outside Tabs', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tab value="x">X</Tab>)).toThrow();
    spy.mockRestore();
  });

  it('does nothing on keyboard navigation when all tabs are disabled', () => {
    render(
      <Tabs defaultValue="a">
        <TabList>
          <Tab value="a" disabled>
            A
          </Tab>
          <Tab value="b" disabled>
            B
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="a">Panel A</TabPanel>
          <TabPanel value="b">Panel B</TabPanel>
        </TabPanels>
      </Tabs>
    );

    const tabA = screen.getByRole('tab', { name: 'A' });
    const tabB = screen.getByRole('tab', { name: 'B' });

    expect(tabA).toHaveAttribute('aria-selected', 'true');
    expect(tabB).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Panel A')).toBeInTheDocument();
    expect(screen.queryByText('Panel B')).not.toBeInTheDocument();

    // All tabs disabled — keyboard navigation should return early without changing selection
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });

    expect(tabA).toHaveAttribute('aria-selected', 'true');
    expect(tabB).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Panel A')).toBeInTheDocument();
    expect(screen.queryByText('Panel B')).not.toBeInTheDocument();
  });

  it('wraps ArrowRight from last tab back to first', async () => {
    render(<BasicTabs />);
    // Navigate to tab2 first
    await userEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));
    // ArrowRight from tab2 (last enabled) should wrap to tab1
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('navigates ArrowLeft from non-first tab', async () => {
    render(<BasicTabs />);
    // Navigate to tab2
    await userEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));
    // ArrowLeft from tab2 (idx 1) should go to tab1 (idx 0)
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' });
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('supports vertical orientation ArrowDown navigation', () => {
    render(
      <Tabs defaultValue="a" orientation="vertical">
        <TabList>
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="a">Panel A</TabPanel>
          <TabPanel value="b">Panel B</TabPanel>
        </TabPanels>
      </Tabs>
    );
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowDown' });
    expect(screen.getByText('Panel B')).toBeInTheDocument();
  });

  it('supports vertical orientation ArrowUp navigation', () => {
    render(
      <Tabs defaultValue="b" orientation="vertical">
        <TabList>
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="a">Panel A</TabPanel>
          <TabPanel value="b">Panel B</TabPanel>
        </TabPanels>
      </Tabs>
    );
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowUp' });
    expect(screen.getByText('Panel A')).toBeInTheDocument();
  });
});

describe('Tabs a11y (axe)', () => {
  it('has no detectable axe violations', async () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabList aria-label="Example tabs">
          <Tab value="tab1">Tab 1</Tab>
          <Tab value="tab2">Tab 2</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="tab1">Content 1</TabPanel>
          <TabPanel value="tab2">Content 2</TabPanel>
        </TabPanels>
      </Tabs>
    );
    await expectNoA11yViolations(container);
  });
});
