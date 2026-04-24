import React, { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: React.ReactNode;
  /**
   * If provided, mount into this element instead of the shared portal host.
   * Accepts an element or a function returning one (evaluated lazily).
   */
  container?: HTMLElement | (() => HTMLElement | null) | null;
  /**
   * When `true`, children are rendered inline rather than through a portal.
   * Useful for SSR environments or tests that do not need portal behaviour.
   */
  disabled?: boolean;
}

/** Lazily-created shared portal host appended to `document.body`. */
let sharedHost: HTMLDivElement | null = null;

function getSharedHost(): HTMLDivElement {
  if (!sharedHost || !document.body.contains(sharedHost)) {
    sharedHost = document.createElement('div');
    sharedHost.dataset.zenputPortal = '';
    // No styles applied deliberately: CSS custom properties (--zp-*) resolve
    // through the React tree parent via createPortal, not the DOM parent.
    document.body.appendChild(sharedHost);
  }
  return sharedHost;
}

// useSyncExternalStore subscription — the snapshot never changes so subscribe
// is a no-op. This gives us SSR-safe mounting detection without setState.
function subscribe(_cb: () => void): () => void {
  return () => {};
}
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Renders children into a portal outside the current DOM hierarchy.
 *
 * - SSR-safe: returns `null` on the server and activates on first client render.
 * - Default container: a single shared `<div data-zenput-portal>` on `document.body`.
 * - CSS custom properties resolve through the React tree parent (how `createPortal` works).
 * - Unmounting removes only the React subtree; the shared host element is kept.
 */
export function Portal({ children, container, disabled = false }: PortalProps): React.ReactElement | null {
  // SSR-safe mounting detection via useSyncExternalStore.
  // getServerSnapshot returns false → renders null on server.
  // getClientSnapshot returns true → activates portal on client.
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (disabled) {
    return <>{children}</>;
  }

  if (!mounted) {
    return null;
  }

  if (container == null) {
    return createPortal(children, getSharedHost());
  }

  if (typeof container === 'function') {
    const resolved = container();
    if (resolved == null) return null;
    return createPortal(children, resolved);
  }

  return createPortal(children, container);
}
