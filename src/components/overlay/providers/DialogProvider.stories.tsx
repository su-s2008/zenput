import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DialogProvider, useConfirm, usePrompt, useAlert, useDialog } from './DialogProvider';
import { Button } from '../../actions/Button';

const meta: Meta = {
  title: 'Components/Overlay/Providers/DialogProvider',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <DialogProvider>
        <Story />
      </DialogProvider>
    ),
  ],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// useConfirm
// ---------------------------------------------------------------------------

export const Confirm: Story = {
  name: 'useConfirm',
  render: () => {
    function Demo() {
      const confirm = useConfirm();
      const [result, setResult] = React.useState<string>('—');

      const handleClick = async () => {
        const ok = await confirm({
          title: 'Delete project?',
          description: 'This action cannot be undone.',
          confirmLabel: 'Delete',
          cancelLabel: 'Keep it',
          destructive: true,
        });
        setResult(ok ? 'Confirmed ✓' : 'Cancelled ✗');
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Button variant="danger" onClick={handleClick}>
            Delete project
          </Button>
          <p style={{ margin: 0 }}>Result: {result}</p>
        </div>
      );
    }
    return <Demo />;
  },
};

// ---------------------------------------------------------------------------
// useConfirm from non-render callback (setTimeout)
// ---------------------------------------------------------------------------

export const ConfirmFromTimeout: Story = {
  name: 'useConfirm — from setTimeout',
  render: () => {
    function Demo() {
      const confirm = useConfirm();
      const [result, setResult] = React.useState<string>('—');

      const handleClick = () => {
        // Trigger from a non-render callback — no JSX placement needed.
        setTimeout(async () => {
          const ok = await confirm({
            title: 'Proceed?',
            description: 'Triggered from setTimeout.',
          });
          setResult(ok ? 'Confirmed ✓' : 'Cancelled ✗');
        }, 200);
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Button onClick={handleClick}>Trigger after 200 ms</Button>
          <p style={{ margin: 0 }}>Result: {result}</p>
        </div>
      );
    }
    return <Demo />;
  },
};

// ---------------------------------------------------------------------------
// usePrompt
// ---------------------------------------------------------------------------

export const Prompt: Story = {
  name: 'usePrompt',
  render: () => {
    function Demo() {
      const prompt = usePrompt();
      const [result, setResult] = React.useState<string>('—');

      const handleClick = async () => {
        const value = await prompt({
          title: 'Rename file',
          label: 'New name',
          defaultValue: 'document.txt',
          validate: (v) => v.trim().length > 0 || 'Name is required',
          confirmLabel: 'Rename',
        });
        setResult(value ?? '(cancelled)');
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Button onClick={handleClick}>Rename file</Button>
          <p style={{ margin: 0 }}>New name: {result}</p>
        </div>
      );
    }
    return <Demo />;
  },
};

// ---------------------------------------------------------------------------
// useAlert
// ---------------------------------------------------------------------------

export const Alert: Story = {
  name: 'useAlert',
  render: () => {
    function Demo() {
      const alert = useAlert();

      const handleSave = async () => {
        // Simulate a save operation
        await new Promise((r) => setTimeout(r, 300));
        await alert({
          title: 'Saved!',
          description: 'Your changes have been saved.',
          confirmLabel: 'Great',
        });
      };

      return <Button onClick={handleSave}>Save changes</Button>;
    }
    return <Demo />;
  },
};

// ---------------------------------------------------------------------------
// useDialog — generic
// ---------------------------------------------------------------------------

export const GenericDialog: Story = {
  name: 'useDialog — generic content',
  render: () => {
    function Demo() {
      const dialog = useDialog();
      const [result, setResult] = React.useState<string>('—');

      const handleClick = () => {
        const handle = dialog.open<string>({
          size: 'sm',
          content: ({ close }) => (
            <div style={{ padding: 24 }}>
              <p>Enter your favourite fruit:</p>
              <input
                autoFocus
                style={{ marginBottom: 12, display: 'block', width: '100%', padding: '4px 8px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') close((e.target as HTMLInputElement).value);
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => close()}>
                  Cancel
                </Button>
                <Button onClick={() => close('🍓')}>Strawberry</Button>
              </div>
            </div>
          ),
        });
        handle.result.then((v) => setResult(v ?? '(cancelled)'));
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Button onClick={handleClick}>Open custom dialog</Button>
          <p style={{ margin: 0 }}>Result: {result}</p>
        </div>
      );
    }
    return <Demo />;
  },
};

// ---------------------------------------------------------------------------
// Stacked dialogs
// ---------------------------------------------------------------------------

export const StackedDialogs: Story = {
  name: 'Stacked dialogs (confirm from confirm)',
  render: () => {
    function Demo() {
      const confirm = useConfirm();
      const [log, setLog] = React.useState<string[]>([]);

      const push = (msg: string) => setLog((prev) => [...prev, msg]);

      const handleClick = async () => {
        const first = confirm({ title: 'Are you sure?', confirmLabel: 'Yes, continue' });
        // A second confirm opens on top before the first resolves.
        const second = await confirm({
          title: 'Really sure?',
          description: 'This is the second confirmation.',
        });
        push(`Inner: ${second ? 'yes' : 'no'}`);
        const firstResult = await first;
        push(`Outer: ${firstResult ? 'yes' : 'no'}`);
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Button onClick={handleClick}>Start stacked confirms</Button>
          <ul style={{ margin: 0, padding: '0 16px' }}>
            {log.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      );
    }
    return <Demo />;
  },
};

// ---------------------------------------------------------------------------
// From fetch().catch()
// ---------------------------------------------------------------------------

export const ConfirmFromFetchCatch: Story = {
  name: 'useAlert — from fetch().catch()',
  render: () => {
    function Demo() {
      const alert = useAlert();

      const handleClick = () => {
        // Show alert from an async error handler — no JSX needed at the call site.
        Promise.reject(new Error('Network timeout')).catch(async (err: Error) => {
          await alert({ title: 'Request failed', description: err.message });
        });
      };

      return (
        <Button variant="danger" onClick={handleClick}>
          Simulate failing fetch
        </Button>
      );
    }
    return <Demo />;
  },
};
