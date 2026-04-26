import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { expectNoA11yViolations } from '../../../test-utils/axe';
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuLabel,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
} from './Menu';

afterEach(() => {
  document.querySelectorAll('[data-zenput-portal]').forEach((el) => el.remove());
});

// ── Shared fixtures ────────────────────────────────────────────────────────

function BasicMenu() {
  return (
    <Menu>
      <MenuTrigger>Open Menu</MenuTrigger>
      <MenuContent aria-label="Actions">
        <MenuItem>Apple</MenuItem>
        <MenuItem>Banana</MenuItem>
        <MenuItem>Cherry</MenuItem>
      </MenuContent>
    </Menu>
  );
}

function SubMenu() {
  return (
    <Menu>
      <MenuTrigger>Open Menu</MenuTrigger>
      <MenuContent aria-label="Actions">
        <MenuItem>Item 1</MenuItem>
        <MenuSub>
          <MenuSubTrigger>More</MenuSubTrigger>
          <MenuSubContent aria-label="Sub actions">
            <MenuItem>Sub A</MenuItem>
            <MenuItem>Sub B</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>
  );
}

/** Renders BasicMenu and clicks the trigger to open it. Returns `{ menuEl, items }`. */
function renderOpenMenu() {
  render(<BasicMenu />);
  act(() => {
    screen.getByRole('button', { name: 'Open Menu' }).click();
  });
  const menuEl = screen.getByRole('menu');
  const items = screen.getAllByRole('menuitem');
  return { menuEl, items };
}

/** Renders SubMenu, opens the parent, then opens the submenu. Returns the sub-menu element. */
function renderOpenSubMenu() {
  render(<SubMenu />);
  act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
  const subTrigger = screen.getByRole('menuitem', { name: /More/i });
  act(() => { subTrigger.click(); });
  const subMenu = screen.getByRole('menu', { name: 'Sub actions' });
  return { subTrigger, subMenu };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Menu', () => {
  it('is closed by default and opens on trigger click', () => {
    render(<BasicMenu />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('sets aria-expanded on trigger', () => {
    render(<BasicMenu />);
    const trigger = screen.getByRole('button', { name: 'Open Menu' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    act(() => { trigger.click(); });

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on Escape and returns focus to trigger', () => {
    render(<BasicMenu />);
    const trigger = screen.getByRole('button', { name: 'Open Menu' });
    act(() => { trigger.click(); });

    const menuEl = screen.getByRole('menu');
    act(() => { fireEvent.keyDown(menuEl, { key: 'Escape' }); });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it('focus returns to trigger on close', () => {
    render(<BasicMenu />);
    const trigger = screen.getByRole('button', { name: 'Open Menu' });
    act(() => { trigger.click(); });
    act(() => { fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' }); });
    expect(document.activeElement).toBe(trigger);
  });

  it('Tab closes menu', () => {
    const { menuEl } = renderOpenMenu();
    act(() => { fireEvent.keyDown(menuEl, { key: 'Tab' }); });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('outside mousedown closes menu', () => {
    render(
      <div>
        <BasicMenu />
        <button data-testid="outside">Outside</button>
      </div>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    act(() => { fireEvent.mouseDown(screen.getByTestId('outside')); });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  // ── Keyboard navigation ──────────────────────────────────────────────────

  it('ArrowDown moves focus to next item', () => {
    const { menuEl, items } = renderOpenMenu();
    act(() => { items[0].focus(); });
    act(() => { fireEvent.keyDown(menuEl, { key: 'ArrowDown' }); });
    expect(document.activeElement).toBe(items[1]);
  });

  it('ArrowDown wraps from last item to first', () => {
    const { menuEl, items } = renderOpenMenu();
    act(() => { items[items.length - 1].focus(); });
    act(() => { fireEvent.keyDown(menuEl, { key: 'ArrowDown' }); });
    expect(document.activeElement).toBe(items[0]);
  });

  it('ArrowUp wraps to last item from first', () => {
    const { menuEl, items } = renderOpenMenu();
    act(() => { items[0].focus(); });
    act(() => { fireEvent.keyDown(menuEl, { key: 'ArrowUp' }); });
    expect(document.activeElement).toBe(items[items.length - 1]);
  });

  it('Home moves to first item', () => {
    const { menuEl, items } = renderOpenMenu();
    act(() => { items[items.length - 1].focus(); });
    act(() => { fireEvent.keyDown(menuEl, { key: 'Home' }); });
    expect(document.activeElement).toBe(items[0]);
  });

  it('End moves to last item', () => {
    const { menuEl, items } = renderOpenMenu();
    act(() => { items[0].focus(); });
    act(() => { fireEvent.keyDown(menuEl, { key: 'End' }); });
    expect(document.activeElement).toBe(items[items.length - 1]);
  });

  it('ArrowLeft does nothing in a top-level menu (no onArrowLeft handler)', () => {
    const { menuEl, items } = renderOpenMenu();
    act(() => { items[0].focus(); });
    act(() => { fireEvent.keyDown(menuEl, { key: 'ArrowLeft' }); });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(document.activeElement).toBe(items[0]);
  });

  it('type-ahead jumps to matching item', () => {
    const { menuEl, items } = renderOpenMenu();
    act(() => { items[0].focus(); });
    act(() => { fireEvent.keyDown(menuEl, { key: 'b' }); });
    expect(document.activeElement).toBe(items.find((el) => el.textContent === 'Banana'));
  });

  it('type-ahead buffer resets after 500 ms', () => {
    vi.useFakeTimers();
    try {
      const { menuEl, items } = renderOpenMenu();
      act(() => { items[0].focus(); });
      act(() => { fireEvent.keyDown(menuEl, { key: 'b' }); });
      expect(document.activeElement).toBe(items.find((el) => el.textContent === 'Banana'));

      act(() => { vi.advanceTimersByTime(600); });

      act(() => { fireEvent.keyDown(menuEl, { key: 'c' }); });
      expect(document.activeElement).toBe(items.find((el) => el.textContent === 'Cherry'));
    } finally {
      vi.useRealTimers();
    }
  });

  // ── MenuItem ─────────────────────────────────────────────────────────────

  it('Enter selects item, calls onSelect, closes menu', () => {
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuItem onSelect={onSelect}>Apple</MenuItem>
          <MenuItem>Banana</MenuItem>
        </MenuContent>
      </Menu>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    const menuEl = screen.getByRole('menu');
    const items = screen.getAllByRole('menuitem');
    act(() => { items[0].focus(); });
    act(() => { fireEvent.keyDown(menuEl, { key: 'Enter' }); });
    expect(onSelect).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('Space key activates focused item', () => {
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuItem onSelect={onSelect}>Apple</MenuItem>
        </MenuContent>
      </Menu>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    const menuEl = screen.getByRole('menu');
    const item = screen.getByRole('menuitem');
    act(() => { item.focus(); });
    act(() => { fireEvent.keyDown(menuEl, { key: ' ' }); });
    expect(onSelect).toHaveBeenCalled();
  });

  it('Enter on focused item calls onSelect exactly once (no double invocation)', () => {
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuItem onSelect={onSelect}>Apple</MenuItem>
          <MenuItem>Banana</MenuItem>
        </MenuContent>
      </Menu>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    const items = screen.getAllByRole('menuitem');
    act(() => { items[0].focus(); });
    act(() => { fireEvent.keyDown(items[0], { key: 'Enter', bubbles: true }); });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('disabled MenuItem does not call onSelect', () => {
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuItem disabled onSelect={onSelect}>Disabled</MenuItem>
        </MenuContent>
      </Menu>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    act(() => { screen.getByRole('menuitem').click(); });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('MenuItem onClick can prevent close with defaultPrevented', () => {
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuItem onClick={onClick} onSelect={onSelect}>Item</MenuItem>
        </MenuContent>
      </Menu>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    act(() => { screen.getByRole('menuitem').click(); });
    expect(onClick).toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  // ── MenuContent props ─────────────────────────────────────────────────────

  it('MenuContent withPortal=false renders inline (not in a portal)', () => {
    const { container } = render(
      <Menu defaultOpen>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent aria-label="Actions" withPortal={false}>
          <MenuItem>Item</MenuItem>
        </MenuContent>
      </Menu>
    );
    expect(container).toContainElement(screen.getByRole('menu'));
  });

  it('Menu controlled open/close via open prop', () => {
    function Controlled() {
      const [open, setOpen] = React.useState(false);
      return (
        <Menu open={open} onOpenChange={setOpen}>
          <MenuTrigger>Open Menu</MenuTrigger>
          <MenuContent aria-label="Actions">
            <MenuItem>Item</MenuItem>
          </MenuContent>
        </Menu>
      );
    }
    render(<Controlled />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    act(() => { screen.getByRole('button').click(); });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('MenuContent side="right" align="end" renders positioned menu', () => {
    render(
      <Menu defaultOpen>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent aria-label="Actions" side="right" align="end" withPortal={false}>
          <MenuItem>Item</MenuItem>
        </MenuContent>
      </Menu>
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('MenuContent side="right" align="center" renders positioned menu', () => {
    render(
      <Menu defaultOpen>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent aria-label="Actions" side="right" align="center" withPortal={false}>
          <MenuItem>Item</MenuItem>
        </MenuContent>
      </Menu>
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('MenuContent auto-focuses first item after open (RAF)', () => {
    vi.useFakeTimers();
    try {
      render(
        <Menu>
          <MenuTrigger>Open Menu</MenuTrigger>
          <MenuContent aria-label="Actions" withPortal={false}>
            <MenuItem>Apple</MenuItem>
            <MenuItem>Banana</MenuItem>
          </MenuContent>
        </Menu>
      );
      act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
      act(() => { vi.runAllTimers(); });
      expect(document.activeElement).toBe(screen.getAllByRole('menuitem')[0]);
    } finally {
      vi.useRealTimers();
    }
  });

  // ── MenuSeparator / MenuLabel ─────────────────────────────────────────────

  it('MenuSeparator renders', () => {
    render(
      <Menu defaultOpen>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent aria-label="Actions" withPortal={false}>
          <MenuItem>Item</MenuItem>
          <MenuSeparator />
          <MenuItem>Item 2</MenuItem>
        </MenuContent>
      </Menu>
    );
    expect(document.querySelector('hr')).toBeInTheDocument();
  });

  it('MenuLabel renders', () => {
    render(
      <Menu defaultOpen>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent aria-label="Actions" withPortal={false}>
          <MenuLabel>Section</MenuLabel>
          <MenuItem>Item</MenuItem>
        </MenuContent>
      </Menu>
    );
    expect(screen.getByText('Section')).toBeInTheDocument();
  });

  // ── MenuCheckboxItem ──────────────────────────────────────────────────────

  it('MenuCheckboxItem toggles checked', () => {
    const onCheckedChange = vi.fn();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Option
          </MenuCheckboxItem>
        </MenuContent>
      </Menu>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    act(() => { screen.getByRole('menuitemcheckbox').click(); });
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('MenuCheckboxItem Enter key toggles checked', () => {
    const onCheckedChange = vi.fn();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Option
          </MenuCheckboxItem>
        </MenuContent>
      </Menu>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    act(() => { fireEvent.keyDown(screen.getByRole('menuitemcheckbox'), { key: 'Enter', bubbles: true }); });
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('MenuCheckboxItem disabled does not toggle', () => {
    const onCheckedChange = vi.fn();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuCheckboxItem checked={false} onCheckedChange={onCheckedChange} disabled>
            Option
          </MenuCheckboxItem>
        </MenuContent>
      </Menu>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    act(() => { screen.getByRole('menuitemcheckbox').click(); });
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('MenuCheckboxItem shows check indicator when checked', () => {
    render(
      <Menu defaultOpen>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent aria-label="Actions" withPortal={false}>
          <MenuCheckboxItem checked>Option</MenuCheckboxItem>
        </MenuContent>
      </Menu>
    );
    expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('aria-checked', 'true');
  });

  // ── MenuRadioGroup ────────────────────────────────────────────────────────

  it('MenuRadioGroup changes value', () => {
    const onValueChange = vi.fn();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuRadioGroup value="a" onValueChange={onValueChange}>
            <MenuRadioItem value="a">Option A</MenuRadioItem>
            <MenuRadioItem value="b">Option B</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    const optionB = screen.getAllByRole('menuitemradio').find((el) => el.textContent?.includes('Option B'));
    act(() => { optionB!.click(); });
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('MenuRadioItem Enter key selects value', () => {
    const onValueChange = vi.fn();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuRadioGroup value="a" onValueChange={onValueChange}>
            <MenuRadioItem value="a">Option A</MenuRadioItem>
            <MenuRadioItem value="b">Option B</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    const optionB = screen.getAllByRole('menuitemradio').find((el) => el.textContent?.includes('Option B'))!;
    act(() => { fireEvent.keyDown(optionB, { key: 'Enter', bubbles: true }); });
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('MenuRadioItem disabled does not call onValueChange', () => {
    const onValueChange = vi.fn();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuRadioGroup value="a" onValueChange={onValueChange}>
            <MenuRadioItem value="b" disabled>Option B</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    act(() => { screen.getByRole('menuitemradio').click(); });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('MenuRadioItem checked state reflects current value', () => {
    render(
      <Menu defaultOpen>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent aria-label="Actions" withPortal={false}>
          <MenuRadioGroup value="b" onValueChange={vi.fn()}>
            <MenuRadioItem value="a">A</MenuRadioItem>
            <MenuRadioItem value="b">B</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    );
    const [itemA, itemB] = screen.getAllByRole('menuitemradio');
    expect(itemA).toHaveAttribute('aria-checked', 'false');
    expect(itemB).toHaveAttribute('aria-checked', 'true');
  });

  // ── Submenu ───────────────────────────────────────────────────────────────

  it('MenuSub opens on MenuSubTrigger click', () => {
    render(<SubMenu />);
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    expect(screen.queryAllByRole('menu')).toHaveLength(1);
    act(() => { screen.getByRole('menuitem', { name: /More/i }).click(); });
    expect(screen.getAllByRole('menu')).toHaveLength(2);
  });

  it('MenuSub opens on MouseEnter', () => {
    render(<SubMenu />);
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    act(() => { fireEvent.mouseEnter(screen.getByRole('menuitem', { name: /More/i })); });
    expect(screen.getAllByRole('menu')).toHaveLength(2);
  });

  it('MenuSub opens on ArrowRight key', () => {
    render(<SubMenu />);
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    act(() => { fireEvent.keyDown(screen.getByRole('menuitem', { name: /More/i }), { key: 'ArrowRight', bubbles: true }); });
    expect(screen.getAllByRole('menu')).toHaveLength(2);
  });

  it('MenuSubContent ArrowLeft closes submenu and focuses sub-trigger', () => {
    const { subTrigger, subMenu } = renderOpenSubMenu();
    act(() => { fireEvent.keyDown(subMenu, { key: 'ArrowLeft' }); });
    expect(screen.getAllByRole('menu')).toHaveLength(1);
    expect(document.activeElement).toBe(subTrigger);
  });

  it('MenuSubContent Escape closes submenu and focuses sub-trigger', () => {
    const { subTrigger, subMenu } = renderOpenSubMenu();
    act(() => { fireEvent.keyDown(subMenu, { key: 'Escape' }); });
    expect(screen.getAllByRole('menu')).toHaveLength(1);
    expect(document.activeElement).toBe(subTrigger);
  });

  it('MenuSubContent Tab closes submenu and parent, focuses trigger', () => {
    render(<SubMenu />);
    const trigger = screen.getByRole('button', { name: 'Open Menu' });
    act(() => { trigger.click(); });
    act(() => { screen.getByRole('menuitem', { name: /More/i }).click(); });
    const subMenu = screen.getByRole('menu', { name: 'Sub actions' });
    act(() => { fireEvent.keyDown(subMenu, { key: 'Tab' }); });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it('MenuSubContent ArrowDown/Up navigate items', () => {
    const { subMenu } = renderOpenSubMenu();
    const subItems = Array.from(subMenu.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    act(() => { subItems[0].focus(); });
    act(() => { fireEvent.keyDown(subMenu, { key: 'ArrowDown' }); });
    expect(document.activeElement).toBe(subItems[1]);
    act(() => { fireEvent.keyDown(subMenu, { key: 'ArrowUp' }); });
    expect(document.activeElement).toBe(subItems[0]);
  });

  it('MenuSubContent auto-focuses first item after open (RAF)', () => {
    vi.useFakeTimers();
    try {
      render(<SubMenu />);
      act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
      act(() => { screen.getByRole('menuitem', { name: /More/i }).click(); });
      act(() => { vi.runAllTimers(); });
      const subMenu = screen.getByRole('menu', { name: 'Sub actions' });
      const subItems = Array.from(subMenu.querySelectorAll<HTMLElement>('[role="menuitem"]'));
      expect(document.activeElement).toBe(subItems[0]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('outside mousedown closes submenu and parent menu', () => {
    render(
      <div>
        <SubMenu />
        <button data-testid="outside">Outside</button>
      </div>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    act(() => { screen.getByRole('menuitem', { name: /More/i }).click(); });
    expect(screen.getAllByRole('menu')).toHaveLength(2);
    act(() => { fireEvent.mouseDown(screen.getByTestId('outside')); });
    expect(screen.queryAllByRole('menu')).toHaveLength(0);
  });

  it('MenuSubTrigger disabled does not open submenu', () => {
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuSub>
            <MenuSubTrigger disabled>More</MenuSubTrigger>
            <MenuSubContent aria-label="Sub">
              <MenuItem>Sub A</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    act(() => { screen.getByRole('menuitem', { name: /More/i }).click(); });
    expect(screen.getAllByRole('menu')).toHaveLength(1);
  });

  // ── Portal / a11y ─────────────────────────────────────────────────────────

  it('portal rendering - menu renders outside main tree', () => {
    render(
      <div data-testid="wrapper">
        <BasicMenu />
      </div>
    );
    act(() => { screen.getByRole('button', { name: 'Open Menu' }).click(); });
    expect(screen.getByTestId('wrapper')).not.toContainElement(screen.getByRole('menu'));
  });

  it('axe accessibility check', async () => {
    const { container } = render(
      <Menu defaultOpen>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuContent aria-label="Actions">
          <MenuItem>Apple</MenuItem>
          <MenuItem>Banana</MenuItem>
          <MenuItem disabled>Cherry (disabled)</MenuItem>
        </MenuContent>
      </Menu>
    );
    await expectNoA11yViolations(container);
  });
});
