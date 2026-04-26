import React, { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from './Toast';
import type { ToastPlacement, ToastStatus } from './Toast';

const meta: Meta<typeof ToastProvider> = {
  title: 'Components/Overlay/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ToastDemo({
  status,
  title,
  description,
}: {
  status: ToastStatus;
  title: string;
  description?: string;
}) {
  const toast = useToast();
  return (
    <button
      type="button"
      style={{ padding: '8px 16px', cursor: 'pointer' }}
      onClick={() => toast.show({ status, title, description })}
    >
      Show {status}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <ToastProvider placement="bottom-right">
      <ToastDemo status="info" title="File uploaded" description="report.csv is ready to view." />
    </ToastProvider>
  ),
};

export const AllStatuses: Story = {
  render: () => {
    function Inner() {
      const toast = useToast();
      return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['info', 'success', 'warning', 'error', 'loading'] as ToastStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              style={{ padding: '8px 16px', cursor: 'pointer', textTransform: 'capitalize' }}
              onClick={() =>
                toast.show({
                  status,
                  title: `${status.charAt(0).toUpperCase() + status.slice(1)} toast`,
                  description: `This is a ${status} notification.`,
                  duration: status === 'loading' ? null : 5000,
                })
              }
            >
              {status}
            </button>
          ))}
        </div>
      );
    }
    return (
      <ToastProvider placement="bottom-right">
        <Inner />
      </ToastProvider>
    );
  },
};

export const WithAction: Story = {
  render: () => {
    function Inner() {
      const toast = useToast();
      return (
        <button
          type="button"
          style={{ padding: '8px 16px', cursor: 'pointer' }}
          onClick={() =>
            toast.show({
              status: 'success',
              title: 'Changes saved',
              description: 'Your draft has been published.',
              action: {
                label: 'Undo',
                onClick: () => alert('Undo clicked!'),
              },
            })
          }
        >
          Show with action
        </button>
      );
    }
    return (
      <ToastProvider placement="bottom-right">
        <Inner />
      </ToastProvider>
    );
  },
};

export const PromiseHelper: Story = {
  render: () => {
    function Inner() {
      const toast = useToast();
      const handleClick = () => {
        const p = new Promise<{ name: string }>((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.4) {
              resolve({ name: 'report.csv' });
            } else {
              reject(new Error('Network error'));
            }
          }, 2000);
        });
        toast
          .promise(p, {
            loading: 'Saving your changes…',
            success: (data) => `Saved ${data.name}!`,
            error: (err) => `Failed: ${(err as Error).message}`,
          })
          .catch(() => {});
      };
      return (
        <button
          type="button"
          style={{ padding: '8px 16px', cursor: 'pointer' }}
          onClick={handleClick}
        >
          Save (random success/fail)
        </button>
      );
    }
    return (
      <ToastProvider placement="bottom-right">
        <Inner />
      </ToastProvider>
    );
  },
};

export const Stacking: Story = {
  render: () => {
    function Inner() {
      const toast = useToast();
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            style={{ padding: '8px 16px', cursor: 'pointer' }}
            onClick={() => {
              toast.show({ status: 'info', title: 'First' });
              setTimeout(() => toast.show({ status: 'success', title: 'Second' }), 300);
              setTimeout(() => toast.show({ status: 'warning', title: 'Third' }), 600);
            }}
          >
            Stack 3 toasts
          </button>
          <button
            type="button"
            style={{ padding: '8px 16px', cursor: 'pointer' }}
            onClick={() => toast.dismiss()}
          >
            Dismiss all
          </button>
        </div>
      );
    }
    return (
      <ToastProvider placement="bottom-right" max={5}>
        <Inner />
      </ToastProvider>
    );
  },
};

export const Persistent: Story = {
  render: () => {
    function Inner() {
      const toast = useToast();
      const idRef = useRef<string>('');
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            style={{ padding: '8px 16px', cursor: 'pointer' }}
            onClick={() => {
              idRef.current = toast.show({
                status: 'info',
                title: 'Persistent toast',
                description: 'Will not auto-dismiss.',
                duration: null,
              });
            }}
          >
            Show persistent
          </button>
          <button
            type="button"
            style={{ padding: '8px 16px', cursor: 'pointer' }}
            onClick={() => toast.dismiss(idRef.current)}
          >
            Dismiss by ID
          </button>
        </div>
      );
    }
    return (
      <ToastProvider placement="bottom-right">
        <Inner />
      </ToastProvider>
    );
  },
};

export const Placements: Story = {
  render: () => {
    const placements: ToastPlacement[] = [
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ];

    function Inner({ placement }: { placement: ToastPlacement }) {
      const toast = useToast();
      return (
        <button
          type="button"
          style={{ padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}
          onClick={() => toast.show({ status: 'info', title: placement })}
        >
          {placement}
        </button>
      );
    }

    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {placements.map((p) => (
          <ToastProvider key={p} placement={p}>
            <Inner placement={p} />
          </ToastProvider>
        ))}
      </div>
    );
  },
};

export const CustomIcon: Story = {
  render: () => {
    function Inner() {
      const toast = useToast();
      return (
        <button
          type="button"
          style={{ padding: '8px 16px', cursor: 'pointer' }}
          onClick={() =>
            toast.show({
              title: 'Custom icon toast',
              description: 'Using an emoji as the icon.',
              icon: <span style={{ fontSize: 16 }}>🎉</span>,
            })
          }
        >
          Show custom icon
        </button>
      );
    }
    return (
      <ToastProvider placement="bottom-right">
        <Inner />
      </ToastProvider>
    );
  },
};
