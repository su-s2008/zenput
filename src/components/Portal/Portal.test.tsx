import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, afterEach } from 'vitest';
import { Portal } from './Portal';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Remove any shared portal host between tests so they are isolated. */
afterEach(() => {
  document.querySelectorAll('[data-zenput-portal]').forEach((el) => el.remove());
  // Reset the module-level cached host so next test gets a fresh one.
  // We do this by removing all matching elements; the lazy getter will
  // re-create it on next use.
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Portal', () => {
  it('renders children into document.body (via shared host) by default', async () => {
    render(<Portal><span data-testid="child">hello</span></Portal>);

    await waitFor(() => {
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    const host = document.querySelector('[data-zenput-portal]');
    expect(host).not.toBeNull();
    expect(host).toContainElement(screen.getByTestId('child'));
  });

  it('renders into a custom container element', async () => {
    const container = document.createElement('div');
    container.setAttribute('data-testid', 'custom-container');
    document.body.appendChild(container);

    render(<Portal container={container}><span data-testid="custom-child">world</span></Portal>);

    await waitFor(() => {
      expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    });

    expect(container).toContainElement(screen.getByTestId('custom-child'));

    container.remove();
  });

  it('renders into a container returned by a function', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      <Portal container={() => container}>
        <span data-testid="fn-child">fn container</span>
      </Portal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('fn-child')).toBeInTheDocument();
    });

    expect(container).toContainElement(screen.getByTestId('fn-child'));
    container.remove();
  });

  it('renders inline (no portal) when disabled=true', () => {
    const { container: wrapper } = render(
      <div data-testid="wrapper">
        <Portal disabled><span data-testid="inline-child">inline</span></Portal>
      </div>
    );

    const inlineChild = screen.getByTestId('inline-child');
    expect(wrapper).toContainElement(inlineChild);

    // The shared host should NOT have been created (or if it exists from another test,
    // it should not contain this child).
    const host = document.querySelector('[data-zenput-portal]');
    if (host) {
      expect(host).not.toContainElement(inlineChild);
    }
  });

  it('does not render on the server (renderToString returns empty)', () => {
    const html = renderToString(
      <Portal><span>server child</span></Portal>
    );
    // Portal returns null on server (before mount effect runs), so no portal content.
    expect(html).toBe('');
  });

  it('unmounting removes children but leaves the shared host', async () => {
    const { unmount } = render(
      <Portal><span data-testid="to-remove">will go away</span></Portal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('to-remove')).toBeInTheDocument();
    });

    const host = document.querySelector('[data-zenput-portal]');
    expect(host).not.toBeNull();

    act(() => {
      unmount();
    });

    // Child is gone.
    expect(document.querySelector('[data-testid="to-remove"]')).toBeNull();
    // Host remains.
    expect(document.querySelector('[data-zenput-portal]')).not.toBeNull();
  });
});
