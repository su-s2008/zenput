import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { DialogProvider, useConfirm, usePrompt, useAlert, useDialog } from './DialogProvider';

afterEach(() => {
  document.querySelectorAll('[data-zenput-portal]').forEach((el) => el.remove());
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ConfirmButton({
  options,
  onResult,
}: {
  options?: Parameters<ReturnType<typeof useConfirm>>[0];
  onResult: (v: boolean) => void;
}) {
  const confirm = useConfirm();
  return (
    <button
      onClick={async () => {
        const result = await confirm(options);
        onResult(result);
      }}
    >
      Open Confirm
    </button>
  );
}

function PromptButton({
  options,
  onResult,
}: {
  options?: Parameters<ReturnType<typeof usePrompt>>[0];
  onResult: (v: string | null) => void;
}) {
  const prompt = usePrompt();
  return (
    <button
      onClick={async () => {
        const result = await prompt(options);
        onResult(result);
      }}
    >
      Open Prompt
    </button>
  );
}

function AlertButton({
  options,
  onResult,
}: {
  options?: Parameters<ReturnType<typeof useAlert>>[0];
  onResult: () => void;
}) {
  const alert = useAlert();
  return (
    <button
      onClick={async () => {
        await alert(options);
        onResult();
      }}
    >
      Open Alert
    </button>
  );
}

function GenericDialogButton({ onResult }: { onResult: (v: unknown) => void }) {
  const dialog = useDialog();
  return (
    <button
      onClick={() => {
        const handle = dialog.open({
          content: ({ close }) => (
            <>
              <button onClick={() => close('hello')}>Submit</button>
              <button onClick={() => close()}>Cancel</button>
            </>
          ),
        });
        handle.result.then(onResult);
      }}
    >
      Open Dialog
    </button>
  );
}

// ---------------------------------------------------------------------------
// useConfirm tests
// ---------------------------------------------------------------------------

describe('useConfirm', () => {
  it('renders a confirm dialog when invoked', async () => {
    render(
      <DialogProvider>
        <ConfirmButton onResult={() => undefined} />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Confirm').click();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('resolves true when Confirm is clicked', async () => {
    const results: boolean[] = [];
    render(
      <DialogProvider>
        <ConfirmButton
          options={{ title: 'Delete?', confirmLabel: 'Delete', cancelLabel: 'No' }}
          onResult={(v) => results.push(v)}
        />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Confirm').click();
    });
    await act(async () => {
      screen.getByText('Delete').click();
    });

    expect(results).toEqual([true]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('resolves false when Cancel is clicked', async () => {
    const results: boolean[] = [];
    render(
      <DialogProvider>
        <ConfirmButton
          options={{ confirmLabel: 'Yes', cancelLabel: 'No' }}
          onResult={(v) => results.push(v)}
        />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Confirm').click();
    });
    await act(async () => {
      screen.getByText('No').click();
    });

    expect(results).toEqual([false]);
  });

  it('resolves false on Escape when dismissible (default)', async () => {
    const results: boolean[] = [];
    render(
      <DialogProvider>
        <ConfirmButton onResult={(v) => results.push(v)} />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Confirm').click();
    });
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(results).toEqual([false]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not close on Escape when dismissible=false', async () => {
    render(
      <DialogProvider>
        <ConfirmButton options={{ dismissible: false }} onResult={() => undefined} />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Confirm').click();
    });
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('uses danger variant for destructive confirm', async () => {
    render(
      <DialogProvider>
        <ConfirmButton
          options={{ destructive: true, confirmLabel: 'Delete' }}
          onResult={() => undefined}
        />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Confirm').click();
    });

    const deleteBtn = screen.getByText('Delete');
    expect(deleteBtn).toBeInTheDocument();
  });

  it('stacks two confirms on top of each other', async () => {
    function NestedConfirm() {
      const confirm = useConfirm();
      return (
        <button
          onClick={async () => {
            const first = confirm({ title: 'First Confirm' });
            await confirm({ title: 'Second Confirm' });
            await first;
          }}
        >
          Start
        </button>
      );
    }

    render(
      <DialogProvider>
        <NestedConfirm />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Start').click();
    });

    const dialogs = screen.getAllByRole('dialog');
    expect(dialogs.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// usePrompt tests
// ---------------------------------------------------------------------------

describe('usePrompt', () => {
  it('renders a prompt dialog when invoked', async () => {
    render(
      <DialogProvider>
        <PromptButton onResult={() => undefined} />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Prompt').click();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('resolves with the input value when OK is clicked', async () => {
    const results: (string | null)[] = [];
    render(
      <DialogProvider>
        <PromptButton
          options={{ title: 'Rename', label: 'New name', defaultValue: 'file.txt' }}
          onResult={(v) => results.push(v)}
        />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Prompt').click();
    });
    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'new-file.txt' } });
    });
    await act(async () => {
      screen.getByText('OK').click();
    });

    expect(results).toEqual(['new-file.txt']);
  });

  it('resolves null when Cancel is clicked', async () => {
    const results: (string | null)[] = [];
    render(
      <DialogProvider>
        <PromptButton onResult={(v) => results.push(v)} />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Prompt').click();
    });
    await act(async () => {
      screen.getByText('Cancel').click();
    });

    expect(results).toEqual([null]);
  });

  it('shows validation error and does not close on invalid input', async () => {
    const results: (string | null)[] = [];
    render(
      <DialogProvider>
        <PromptButton
          options={{
            validate: (v) => v.length > 0 || 'Required',
          }}
          onResult={(v) => results.push(v)}
        />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Prompt').click();
    });
    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
    });
    await act(async () => {
      screen.getByText('OK').click();
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Required');
    expect(results).toEqual([]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('submits on Enter keydown', async () => {
    const results: (string | null)[] = [];
    render(
      <DialogProvider>
        <PromptButton options={{ defaultValue: 'typed' }} onResult={(v) => results.push(v)} />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Prompt').click();
    });
    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    expect(results).toEqual(['typed']);
  });
});

// ---------------------------------------------------------------------------
// useAlert tests
// ---------------------------------------------------------------------------

describe('useAlert', () => {
  it('renders an alert dialog and resolves on OK', async () => {
    let resolved = false;
    render(
      <DialogProvider>
        <AlertButton
          options={{ title: 'Saved', description: 'Changes saved.' }}
          onResult={() => {
            resolved = true;
          }}
        />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Alert').click();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();

    await act(async () => {
      screen.getByText('OK').click();
    });

    expect(resolved).toBe(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// useDialog tests
// ---------------------------------------------------------------------------

describe('useDialog', () => {
  it('opens a generic dialog and resolves with the close value', async () => {
    const results: unknown[] = [];
    render(
      <DialogProvider>
        <GenericDialogButton onResult={(v) => results.push(v)} />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Dialog').click();
    });
    await act(async () => {
      screen.getByText('Submit').click();
    });

    await waitFor(() => expect(results).toEqual(['hello']));
  });

  it('resolves null when Cancel is clicked', async () => {
    const results: unknown[] = [];
    render(
      <DialogProvider>
        <GenericDialogButton onResult={(v) => results.push(v)} />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Dialog').click();
    });
    await act(async () => {
      screen.getByText('Cancel').click();
    });

    await waitFor(() => expect(results).toEqual([null]));
  });

  it('can be closed programmatically via handle.close()', async () => {
    function HandleCloser() {
      const dialog = useDialog();
      const handleRef = React.useRef<ReturnType<typeof dialog.open> | null>(null);
      return (
        <>
          <button
            onClick={() => {
              handleRef.current = dialog.open({ content: () => <span>Content</span> });
            }}
          >
            Open
          </button>
          <button onClick={() => handleRef.current?.close()}>Close Handle</button>
        </>
      );
    }

    render(
      <DialogProvider>
        <HandleCloser />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open').click();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await act(async () => {
      screen.getByText('Close Handle').click();
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Provider error guard
// ---------------------------------------------------------------------------

describe('hook guard', () => {
  it('throws when useConfirm is called outside DialogProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => {
      render(
        <React.Suspense fallback={null}>
          <ConfirmButton onResult={() => undefined} />
        </React.Suspense>
      );
    }).toThrow();
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Additional branch coverage
// ---------------------------------------------------------------------------

describe('useConfirm - branch coverage', () => {
  it('renders the description when provided', async () => {
    render(
      <DialogProvider>
        <ConfirmButton
          options={{ title: 'Confirm', description: 'Are you sure about this?' }}
          onResult={() => undefined}
        />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Confirm').click();
    });

    expect(screen.getByText('Are you sure about this?')).toBeInTheDocument();
  });

  it('uses default labels when none are provided', async () => {
    render(
      <DialogProvider>
        <ConfirmButton onResult={() => undefined} />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Confirm').click();
    });

    // Both title and confirm button use "Confirm" as default label
    expect(screen.getAllByText('Confirm').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});

describe('usePrompt - branch coverage', () => {
  it('shows the generic "Invalid value" error when validate returns false (no string)', async () => {
    render(
      <DialogProvider>
        <PromptButton options={{ validate: () => false }} onResult={() => undefined} />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Prompt').click();
    });
    await act(async () => {
      screen.getByText('OK').click();
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid value');
  });

  it('renders without a label when none is provided', async () => {
    render(
      <DialogProvider>
        <PromptButton onResult={() => undefined} />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Prompt').click();
    });

    expect(screen.queryByText('New name')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('uses default title and labels when none are provided', async () => {
    render(
      <DialogProvider>
        <PromptButton onResult={() => undefined} />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Prompt').click();
    });

    expect(screen.getByText('Enter a value')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});

describe('useAlert - branch coverage', () => {
  it('uses default title and dismiss label when none are provided', async () => {
    render(
      <DialogProvider>
        <AlertButton onResult={() => undefined} />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Alert').click();
    });

    expect(screen.getByText('Alert')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('renders without a description when none is provided', async () => {
    render(
      <DialogProvider>
        <AlertButton onResult={() => undefined} />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open Alert').click();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('DialogProvider - unmount cleanup', () => {
  it('resolves useDialog pending promise with null on provider unmount', async () => {
    const results: unknown[] = [];

    function App() {
      const dialog = useDialog();
      return (
        <button
          onClick={() => {
            const handle = dialog.open({
              content: () => <span>Open dialog</span>,
            });
            handle.result.then((v) => results.push(v));
          }}
        >
          Open
        </button>
      );
    }

    const { unmount } = render(
      <DialogProvider>
        <App />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open').click();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    unmount();

    // Allow microtasks to flush so the resolved promise propagates.
    await act(async () => {
      await Promise.resolve();
    });

    // useDialog default dismissed value is null.
    expect(results).toEqual([null]);
  });

  it('resolves useAlert pending promise with undefined on provider unmount', async () => {
    let resolved: unknown = 'NOT_CALLED';

    function App() {
      const alert = useAlert();
      return (
        <button
          onClick={() => {
            alert({ title: 'Wait' }).then((v) => {
              resolved = v;
            });
          }}
        >
          Open
        </button>
      );
    }

    const { unmount } = render(
      <DialogProvider>
        <App />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open').click();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    unmount();

    await act(async () => {
      await Promise.resolve();
    });

    // useAlert dismissed value is undefined (void), not null.
    expect(resolved).toBeUndefined();
  });

  it('resolves useConfirm pending promise with false on provider unmount', async () => {
    const results: boolean[] = [];

    function App() {
      const confirm = useConfirm();
      return (
        <button
          onClick={() => {
            confirm({ title: 'Are you sure?' }).then((v) => results.push(v));
          }}
        >
          Open
        </button>
      );
    }

    const { unmount } = render(
      <DialogProvider>
        <App />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Open').click();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    unmount();

    await act(async () => {
      await Promise.resolve();
    });

    // useConfirm dismissed value is false.
    expect(results).toEqual([false]);
  });
});

// ---------------------------------------------------------------------------
// Topmost-only dismissal for stacked dialogs
// ---------------------------------------------------------------------------

describe('DialogProvider - stacked dismissal', () => {
  it('dismisses only the topmost stacked dialog on Escape', async () => {
    function NestedConfirm() {
      const confirm = useConfirm();
      return (
        <button
          onClick={() => {
            // Fire two confirms back-to-back; both go on the stack.
            void confirm({ title: 'First Confirm' });
            void confirm({ title: 'Second Confirm' });
          }}
        >
          Start
        </button>
      );
    }

    render(
      <DialogProvider>
        <NestedConfirm />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Start').click();
    });

    expect(screen.getAllByRole('dialog')).toHaveLength(2);
    expect(screen.getByText('First Confirm')).toBeInTheDocument();
    expect(screen.getByText('Second Confirm')).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    await waitFor(() => {
      expect(screen.getAllByRole('dialog')).toHaveLength(1);
    });

    expect(screen.getByText('First Confirm')).toBeInTheDocument();
    expect(screen.queryByText('Second Confirm')).not.toBeInTheDocument();
  });

  it('does not dismiss the underlying dialog when the topmost is non-dismissible', async () => {
    function NestedNonDismissible() {
      const confirm = useConfirm();
      return (
        <button
          onClick={() => {
            void confirm({ title: 'First Confirm' });
            void confirm({ title: 'Second Confirm', dismissible: false });
          }}
        >
          Start
        </button>
      );
    }

    render(
      <DialogProvider>
        <NestedNonDismissible />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Start').click();
    });

    expect(screen.getAllByRole('dialog')).toHaveLength(2);

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    // Neither dialog should be dismissed: top is non-dismissible (so Escape
    // is a no-op), and the underlying dialog must not receive the key.
    expect(screen.getAllByRole('dialog')).toHaveLength(2);
    expect(screen.getByText('First Confirm')).toBeInTheDocument();
    expect(screen.getByText('Second Confirm')).toBeInTheDocument();
  });
});

describe('usePrompt - unique input ids', () => {
  it('assigns distinct input ids to stacked prompt dialogs', async () => {
    function NestedPrompt() {
      const prompt = usePrompt();
      return (
        <button
          onClick={() => {
            void prompt({ label: 'First' });
            void prompt({ label: 'Second' });
          }}
        >
          Start
        </button>
      );
    }

    render(
      <DialogProvider>
        <NestedPrompt />
      </DialogProvider>
    );

    await act(async () => {
      screen.getByText('Start').click();
    });

    const inputs = document.querySelectorAll<HTMLInputElement>('input[id^="zdp-prompt-input-"]');
    expect(inputs).toHaveLength(2);
    expect(inputs[0].id).not.toEqual(inputs[1].id);
  });
});
