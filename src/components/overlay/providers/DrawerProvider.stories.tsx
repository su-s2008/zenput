import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  DrawerProvider,
  useDrawer,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
} from './DrawerProvider';
import { Button } from '../../actions/Button';

const meta: Meta = {
  title: 'Components/Overlay/Providers/DrawerProvider',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <DrawerProvider>
        <Story />
      </DrawerProvider>
    ),
  ],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Basic useDrawer
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'useDrawer — basic',
  render: () => {
    function Demo() {
      const drawer = useDrawer();
      const [result, setResult] = React.useState<string>('—');

      const handleClick = () => {
        const handle = drawer.open({
          side: 'right',
          content: ({ close }) => (
            <>
              <DrawerHeader>
                <DrawerTitle>Filters</DrawerTitle>
              </DrawerHeader>
              <DrawerBody>
                <p>Pick your filters here.</p>
              </DrawerBody>
              <DrawerFooter>
                <Button variant="secondary" onClick={() => close()}>
                  Cancel
                </Button>
                <Button onClick={() => close('applied')}>Apply filters</Button>
              </DrawerFooter>
            </>
          ),
        });
        handle.result.then((v) => setResult((v as string) ?? '(cancelled)'));
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Button onClick={handleClick}>Open filter drawer</Button>
          <p style={{ margin: 0 }}>Result: {result}</p>
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
  name: 'useDrawer — all sides',
  render: () => {
    function Demo() {
      const drawer = useDrawer();

      return (
        <div style={{ display: 'flex', gap: 8 }}>
          {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
            <Button
              key={side}
              onClick={() =>
                drawer.open({
                  side,
                  content: ({ close }) => (
                    <>
                      <DrawerHeader>
                        <DrawerTitle>From the {side}</DrawerTitle>
                      </DrawerHeader>
                      <DrawerBody>Slide-in panel from {side}.</DrawerBody>
                      <DrawerFooter>
                        <Button onClick={() => close()}>Close</Button>
                      </DrawerFooter>
                    </>
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

// ---------------------------------------------------------------------------
// From row action (non-render callback)
// ---------------------------------------------------------------------------

export const FromRowAction: Story = {
  name: 'useDrawer — from DataTable row action',
  render: () => {
    const rows = [
      { id: 1, name: 'Alice', role: 'Engineer' },
      { id: 2, name: 'Bob', role: 'Designer' },
      { id: 3, name: 'Carol', role: 'Manager' },
    ];

    function Demo() {
      const drawer = useDrawer();

      return (
        <table style={{ borderCollapse: 'collapse', width: 400 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 8px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '4px 8px' }}>Role</th>
              <th style={{ padding: '4px 8px' }}>
                <span
                  style={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    padding: 0,
                    margin: -1,
                    overflow: 'hidden',
                    clip: 'rect(0,0,0,0)',
                    whiteSpace: 'nowrap',
                    border: 0,
                  }}
                >
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px' }}>{row.name}</td>
                <td style={{ padding: '8px' }}>{row.role}</td>
                <td style={{ padding: '8px' }}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      drawer.open({
                        side: 'right',
                        content: ({ close }) => (
                          <>
                            <DrawerHeader>
                              <DrawerTitle>{row.name}</DrawerTitle>
                            </DrawerHeader>
                            <DrawerBody>
                              <p>Role: {row.role}</p>
                              <p>ID: {row.id}</p>
                            </DrawerBody>
                            <DrawerFooter>
                              <Button onClick={() => close()}>Close</Button>
                            </DrawerFooter>
                          </>
                        ),
                      })
                    }
                  >
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return <Demo />;
  },
};
