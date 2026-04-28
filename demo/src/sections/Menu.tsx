import { useState } from 'react';
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
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
} from 'zenput';
import { Section, Scenario } from './_shell';

export function MenuSection() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [colour, setColour] = useState('blue');

  return (
    <Section
      id="menu"
      name="Menu / ContextMenu"
      description="Dropdown menus with items, separators, checkboxes, radio groups, sub-menus, and a right-click ContextMenu."
    >
      <Scenario title="Basic dropdown">
        <Menu>
          <MenuTrigger>Open menu ▾</MenuTrigger>
          <MenuContent>
            <MenuLabel>Actions</MenuLabel>
            <MenuItem onSelect={() => alert('New file')}>New file</MenuItem>
            <MenuItem onSelect={() => alert('Open')}>Open…</MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={() => alert('Save')}>Save</MenuItem>
            <MenuItem onSelect={() => alert('Save As')}>Save As…</MenuItem>
            <MenuSeparator />
            <MenuItem disabled>Print (disabled)</MenuItem>
          </MenuContent>
        </Menu>
      </Scenario>

      <Scenario title="Checkbox items">
        <Menu>
          <MenuTrigger>Format ▾</MenuTrigger>
          <MenuContent>
            <MenuLabel>Text style</MenuLabel>
            <MenuCheckboxItem checked={bold} onCheckedChange={setBold}>
              Bold
            </MenuCheckboxItem>
            <MenuCheckboxItem checked={italic} onCheckedChange={setItalic}>
              Italic
            </MenuCheckboxItem>
          </MenuContent>
        </Menu>
        <p style={{ fontSize: '0.85em', color: 'var(--zp-color-text-muted)', marginTop: '8px' }}>
          Bold: {String(bold)}, Italic: {String(italic)}
        </p>
      </Scenario>

      <Scenario title="Radio group">
        <Menu>
          <MenuTrigger>Colour ▾</MenuTrigger>
          <MenuContent>
            <MenuLabel>Pick a colour</MenuLabel>
            <MenuRadioGroup value={colour} onValueChange={setColour}>
              <MenuRadioItem value="blue">Blue</MenuRadioItem>
              <MenuRadioItem value="red">Red</MenuRadioItem>
              <MenuRadioItem value="green">Green</MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
        <p style={{ fontSize: '0.85em', color: 'var(--zp-color-text-muted)', marginTop: '8px' }}>
          Selected: <strong>{colour}</strong>
        </p>
      </Scenario>

      <Scenario title="Sub-menu">
        <Menu>
          <MenuTrigger>Actions ▾</MenuTrigger>
          <MenuContent>
            <MenuItem onSelect={() => {}}>Cut</MenuItem>
            <MenuItem onSelect={() => {}}>Copy</MenuItem>
            <MenuSub>
              <MenuSubTrigger>More ›</MenuSubTrigger>
              <MenuSubContent>
                <MenuItem onSelect={() => {}}>Duplicate</MenuItem>
                <MenuItem onSelect={() => {}}>Archive</MenuItem>
                <MenuSeparator />
                <MenuItem onSelect={() => {}}>Delete</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuContent>
        </Menu>
      </Scenario>

      <Scenario title="ContextMenu (right-click)">
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              style={{
                padding: '24px',
                border: '2px dashed var(--zp-color-border-default)',
                borderRadius: 'var(--zp-radius-md)',
                textAlign: 'center',
                userSelect: 'none',
                color: 'var(--zp-color-text-muted)',
              }}
            >
              Right-click (or long-press) this area
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <MenuItem onSelect={() => {}}>View</MenuItem>
            <MenuItem onSelect={() => {}}>Edit</MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={() => {}}>Copy link</MenuItem>
            <MenuItem onSelect={() => {}}>Share</MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={() => {}}>Delete</MenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Scenario>
    </Section>
  );
}
