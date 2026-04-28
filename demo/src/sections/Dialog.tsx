import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from 'zenput';
import type { DialogSize } from 'zenput';
import { Section, Scenario } from './_shell';

// ---------------------------------------------------------------------------
// Nested confirm demo
// ---------------------------------------------------------------------------

function NestedConfirmDialog() {
  return (
    <Dialog>
      <DialogTrigger>Open outer dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Outer dialog</DialogTitle>
          <DialogDescription>This dialog contains a nested confirmation.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p>Some content here. Click below to trigger a nested confirm dialog.</p>
          <Dialog>
            <DialogTrigger>Delete item</DialogTrigger>
            <DialogContent size="sm">
              <DialogHeader>
                <DialogTitle>Confirm deletion</DialogTitle>
                <DialogDescription>This action cannot be undone.</DialogDescription>
              </DialogHeader>
              <DialogBody>
                <p>Are you sure you want to delete this item?</p>
              </DialogBody>
              <DialogFooter>
                <DialogClose>Cancel</DialogClose>
                <button
                  type="button"
                  style={{ color: 'var(--zp-color-danger)', fontWeight: 600 }}
                >
                  Delete
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DialogBody>
        <DialogFooter>
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Scrollable body demo
// ---------------------------------------------------------------------------

function ScrollableDialog() {
  return (
    <Dialog>
      <DialogTrigger>Open scrollable dialog</DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>Please read and accept our terms.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} style={{ marginBottom: '12px' }}>
              Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose>Decline</DialogClose>
          <DialogClose>Accept &amp; continue</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export function DialogSection() {
  const sizes: DialogSize[] = ['sm', 'md', 'lg', 'xl'];

  return (
    <Section
      id="dialog"
      name="Dialog"
      description="Accessible modal dialog — sizes, scrollable body, nested confirm, and controlled open state."
    >
      <Scenario title="Sizes">
        <div className="row">
          {sizes.map((size) => (
            <Dialog key={size}>
              <DialogTrigger style={{ textTransform: 'uppercase' }}>{size}</DialogTrigger>
              <DialogContent size={size}>
                <DialogHeader>
                  <DialogTitle>Dialog — {size.toUpperCase()}</DialogTitle>
                  <DialogDescription>
                    This is the <strong>{size}</strong> dialog size.
                  </DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <p>Content area for a <code>{size}</code>-sized dialog.</p>
                </DialogBody>
                <DialogFooter>
                  <DialogClose>Cancel</DialogClose>
                  <DialogClose>Confirm</DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </Scenario>

      <Scenario title="Scrollable body">
        <ScrollableDialog />
      </Scenario>

      <Scenario title="Nested confirm">
        <NestedConfirmDialog />
      </Scenario>

      <Scenario title="Controlled (no backdrop close)">
        <ControlledDialog />
      </Scenario>
    </Section>
  );
}

function ControlledDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen} closeOnOverlayClick={false}>
      {/* DialogTrigger is used here so focus is properly restored on close */}
      <DialogTrigger onClick={() => setOpen(true)}>
        Open controlled dialog
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Controlled dialog</DialogTitle>
          <DialogDescription>Backdrop clicks are disabled — use the button to close.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p>This dialog is controlled externally. Clicking outside will not close it.</p>
        </DialogBody>
        <DialogFooter>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
