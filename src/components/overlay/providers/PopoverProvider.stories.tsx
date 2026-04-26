import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PopoverProvider, usePopover } from './PopoverProvider';
import { Button } from '../../actions/Button';

const meta: Meta = {
  title: 'Components/Overlay/Providers/PopoverProvider',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <PopoverProvider>
        <Story />
      </PopoverProvider>
    ),
  ],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Basic usePopover anchored to a button
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'usePopover — anchored to button',
  render: () => {
    function Demo() {
      const popover = usePopover();
      const buttonRef = React.useRef<HTMLButtonElement>(null);
      const [result, setResult] = React.useState<string>('—');

      const handleClick = () => {
        const handle = popover.open({
          anchor: buttonRef as React.RefObject<HTMLElement>,
          side: 'bottom',
          content: ({ close }) => (
            <div style={{ padding: 12 }}>
              <p style={{ margin: '0 0 8px' }}>Pick an option:</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="sm" onClick={() => close('Option A')}>
                  Option A
                </Button>
                <Button size="sm" variant="secondary" onClick={() => close('Option B')}>
                  Option B
                </Button>
              </div>
            </div>
          ),
        });
        handle.result.then((v) => setResult((v as string) ?? '(dismissed)'));
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Button ref={buttonRef} onClick={handleClick}>
            Open popover
          </Button>
          <p style={{ margin: 0 }}>Selected: {result}</p>
        </div>
      );
    }
    return <Demo />;
  },
};

// ---------------------------------------------------------------------------
// Anchored to coordinates (e.g. right-click context menu)
// ---------------------------------------------------------------------------

export const ContextMenu: Story = {
  name: 'usePopover — context menu at cursor',
  render: () => {
    function Demo() {
      const popover = usePopover();

      const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        popover.open({
          anchor: { x: e.clientX, y: e.clientY },
          side: 'bottom',
          align: 'start',
          content: ({ close }) => (
            <ul style={{ listStyle: 'none', margin: 0, padding: '4px 0', minWidth: 160 }}>
              {['Copy', 'Paste', 'Delete'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => close(item)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          ),
        });
      };

      return (
        <div
          onContextMenu={handleContextMenu}
          style={{
            width: 300,
            height: 150,
            border: '2px dashed #e5e7eb',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
          }}
        >
          Right-click anywhere here
        </div>
      );
    }
    return <Demo />;
  },
};

// ---------------------------------------------------------------------------
// Sides
// ---------------------------------------------------------------------------

export const Sides: Story = {
  name: 'usePopover — sides',
  render: () => {
    function Demo() {
      const popover = usePopover();
      const refs = {
        top: React.useRef<HTMLButtonElement>(null),
        bottom: React.useRef<HTMLButtonElement>(null),
        left: React.useRef<HTMLButtonElement>(null),
        right: React.useRef<HTMLButtonElement>(null),
      };

      return (
        <div style={{ display: 'flex', gap: 8 }}>
          {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
            <Button
              key={side}
              ref={refs[side]}
              size="sm"
              variant="secondary"
              onClick={() =>
                popover.open({
                  anchor: refs[side] as React.RefObject<HTMLElement>,
                  side,
                  content: ({ close }) => (
                    <div style={{ padding: '8px 12px' }}>
                      Popover on the <strong>{side}</strong>{' '}
                      <button onClick={() => close()} style={{ marginLeft: 8, cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                  ),
                })
              }
            >
              {side}
            </Button>
          ))}
        </div>
      );
    }
    return <Demo />;
  },
};
