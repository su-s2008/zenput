/**
 * Tests for the new ThemeProvider features:
 * - mode="system" with matchMedia
 * - storageKey / storage persistence and rehydration
 * - useColorMode hook
 * - detectHighContrast
 * - Nested ThemeProvider token merging
 * - getColorModeScript anti-flash script
 * - useReducedMotion hook
 */
import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { vi, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme, useColorMode } from './ThemeProvider';
import { getColorModeScript } from './getColorModeScript';
import { useReducedMotion } from './useReducedMotion';

// ── Helpers ──────────────────────────────────────────────────────────────────

type MqlListener = (e: { matches: boolean }) => void;

interface MockMql {
  matches: boolean;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  _listeners: MqlListener[];
  _fire: (matches: boolean) => void;
}

function makeMockMql(initial: boolean): MockMql {
  const mql: MockMql = {
    matches: initial,
    _listeners: [],
    addEventListener: vi.fn((_type: string, fn: MqlListener) => {
      mql._listeners.push(fn);
    }),
    removeEventListener: vi.fn((_type: string, fn: MqlListener) => {
      mql._listeners = mql._listeners.filter((l) => l !== fn);
    }),
    _fire(matches: boolean) {
      mql.matches = matches;
      mql._listeners.forEach((l) => l({ matches }));
    },
  };
  return mql;
}

/** Create a mock MQL that ONLY exposes the legacy addListener/removeListener API. */
function makeLegacyMockMql(initial: boolean): MockMql & {
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
} {
  const mql = makeMockMql(initial) as MockMql & {
    addListener: ReturnType<typeof vi.fn>;
    removeListener: ReturnType<typeof vi.fn>;
    addEventListener: undefined;
    removeEventListener: undefined;
  };
  // Simulate old browser: override addEventListener/removeEventListener
  (mql as unknown as Record<string, unknown>).addEventListener = undefined;
  (mql as unknown as Record<string, unknown>).removeEventListener = undefined;
  mql.addListener = vi.fn((_fn: MqlListener) => {
    mql._listeners.push(_fn);
  });
  mql.removeListener = vi.fn((_fn: MqlListener) => {
    mql._listeners = mql._listeners.filter((l) => l !== _fn);
  });
  return mql;
}

/**
 * Install a mock `window.matchMedia` function that dispatches to `getHandler`.
 * Returns a restore function.
 */
function installMatchMedia(getHandler: (query: string) => MockMql): () => void {
  const mockFn = vi.fn((query: string) => getHandler(query) as unknown as MediaQueryList);
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: mockFn,
  });
  return () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: undefined,
    });
  };
}

// ── Storage mock ──────────────────────────────────────────────────────────────

function makeStorageMock(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null) as Storage['getItem'],
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }) as Storage['setItem'],
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }) as Storage['removeItem'],
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => delete store[k]);
    }) as Storage['clear'],
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null) as Storage['key'],
  };
}

// ── useColorMode ──────────────────────────────────────────────────────────────

describe('useColorMode', () => {
  it('returns default light mode outside a ThemeProvider', () => {
    const { result } = renderHook(() => useColorMode());
    expect(result.current.mode).toBe('light');
    expect(result.current.resolvedMode).toBe('light');
  });

  it('returns the current mode from the nearest ThemeProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'dark' }}>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });
    expect(result.current.mode).toBe('dark');
    expect(result.current.resolvedMode).toBe('dark');
  });

  it('toggle switches from light to dark and back', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'light' }}>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });

    expect(result.current.resolvedMode).toBe('light');

    act(() => result.current.toggle());
    expect(result.current.resolvedMode).toBe('dark');

    act(() => result.current.toggle());
    expect(result.current.resolvedMode).toBe('light');
  });

  it('setMode changes the current mode', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'light' }}>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });

    act(() => result.current.setMode('highContrast'));
    expect(result.current.resolvedMode).toBe('highContrast');
    expect(result.current.mode).toBe('highContrast');
  });
});

// ── mode="system" ─────────────────────────────────────────────────────────────

describe('ThemeProvider mode="system"', () => {
  let darkMql: MockMql;
  let contrastMql: MockMql;
  let restoreMatchMedia: () => void;

  beforeEach(() => {
    darkMql = makeMockMql(false);
    contrastMql = makeMockMql(false);
    restoreMatchMedia = installMatchMedia((query) => {
      if (query === '(prefers-color-scheme: dark)') return darkMql;
      if (query === '(prefers-contrast: more)') return contrastMql;
      return makeMockMql(false);
    });
  });

  afterEach(() => {
    restoreMatchMedia();
  });

  it('defaults to light when OS prefers light', () => {
    darkMql.matches = false;
    const { container } = render(
      <ThemeProvider theme={{ mode: 'system' }}>
        <span />
      </ThemeProvider>
    );
    expect((container.firstChild as HTMLElement).getAttribute('data-zp-theme')).toBe('light');
  });

  it('resolves to dark when OS prefers dark', () => {
    darkMql.matches = true;
    const { container } = render(
      <ThemeProvider theme={{ mode: 'system' }}>
        <span />
      </ThemeProvider>
    );
    expect((container.firstChild as HTMLElement).getAttribute('data-zp-theme')).toBe('dark');
  });

  it('updates when OS preference changes (dark → light)', () => {
    darkMql.matches = true;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'system' }}>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });
    expect(result.current.resolvedMode).toBe('dark');

    act(() => darkMql._fire(false));
    expect(result.current.resolvedMode).toBe('light');
  });

  it('updates when OS preference changes (light → dark)', () => {
    darkMql.matches = false;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'system' }}>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });
    expect(result.current.resolvedMode).toBe('light');

    act(() => darkMql._fire(true));
    expect(result.current.resolvedMode).toBe('dark');
  });

  it('resolvedMode is always a ThemeMode (not "system")', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'system' }}>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });
    expect(['light', 'dark', 'highContrast']).toContain(result.current.resolvedMode);
  });

  it('mode is "system" in the ColorModeContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'system' }}>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });
    expect(result.current.mode).toBe('system');
  });
});

// ── detectHighContrast ────────────────────────────────────────────────────────

describe('ThemeProvider detectHighContrast', () => {
  let darkMql: MockMql;
  let contrastMql: MockMql;
  let restoreMatchMedia: () => void;

  beforeEach(() => {
    darkMql = makeMockMql(false);
    contrastMql = makeMockMql(false);
    restoreMatchMedia = installMatchMedia((query) => {
      if (query === '(prefers-color-scheme: dark)') return darkMql;
      if (query === '(prefers-contrast: more)') return contrastMql;
      return makeMockMql(false);
    });
  });

  afterEach(() => {
    restoreMatchMedia();
  });

  it('resolves to highContrast when OS prefers contrast and detectHighContrast=true', () => {
    contrastMql.matches = true;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'system' }} detectHighContrast>
        {children}
      </ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });
    expect(result.current.resolvedMode).toBe('highContrast');
  });

  it('does NOT resolve to highContrast when detectHighContrast=false (default)', () => {
    contrastMql.matches = true;
    darkMql.matches = false;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'system' }}>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });
    expect(result.current.resolvedMode).toBe('light');
  });

  it('updates resolvedMode when contrast preference changes', () => {
    contrastMql.matches = false;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'system' }} detectHighContrast>
        {children}
      </ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });
    expect(result.current.resolvedMode).toBe('light');

    act(() => contrastMql._fire(true));
    expect(result.current.resolvedMode).toBe('highContrast');
  });
});

// ── storageKey / persistence ──────────────────────────────────────────────────

describe('ThemeProvider storageKey persistence', () => {
  let storageMock: Storage;

  beforeEach(() => {
    storageMock = makeStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: storageMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saves mode to localStorage when setMode is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'light' }} storageKey="zp-theme">
        {children}
      </ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });

    act(() => result.current.setMode('dark'));
    expect(storageMock.setItem).toHaveBeenCalledWith('zp-theme', 'dark');
  });

  it('rehydrates mode from localStorage on mount', () => {
    // Pre-populate storage
    (storageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue('dark');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'light' }} storageKey="zp-theme">
        {children}
      </ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });
    expect(result.current.resolvedMode).toBe('dark');
  });

  it('ignores invalid stored values and falls back to theme.mode', () => {
    (storageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue('invalid-mode');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'dark' }} storageKey="zp-theme">
        {children}
      </ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });
    expect(result.current.resolvedMode).toBe('dark');
  });

  it('stores "system" as the mode (not resolved) when setMode("system") is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'light' }} storageKey="zp-theme">
        {children}
      </ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });

    act(() => result.current.setMode('system'));
    expect(storageMock.setItem).toHaveBeenCalledWith('zp-theme', 'system');
    expect(result.current.mode).toBe('system');
  });
});

// ── sessionStorage ────────────────────────────────────────────────────────────

describe('ThemeProvider sessionStorage', () => {
  let sessionMock: Storage;

  beforeEach(() => {
    sessionMock = makeStorageMock();
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses sessionStorage when storage="sessionStorage"', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'light' }} storageKey="zp-theme" storage="sessionStorage">
        {children}
      </ThemeProvider>
    );
    const { result } = renderHook(() => useColorMode(), { wrapper });

    act(() => result.current.setMode('dark'));
    expect(sessionMock.setItem).toHaveBeenCalledWith('zp-theme', 'dark');
  });
});

// ── Nested ThemeProvider ──────────────────────────────────────────────────────

describe('Nested ThemeProvider', () => {
  it('inner provider inherits parent mode when no mode is set', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'dark' }}>
        <ThemeProvider>{children}</ThemeProvider>
      </ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.mode).toBe('dark');
  });

  it('inner provider can override parent mode', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'dark' }}>
        <ThemeProvider theme={{ mode: 'light' }}>{children}</ThemeProvider>
      </ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.mode).toBe('light');
  });

  it('inner provider merges custom cssVars from parent', () => {
    const { container } = render(
      <ThemeProvider theme={{ cssVars: { '--custom-parent': 'red' } }}>
        <ThemeProvider theme={{ cssVars: { '--custom-child': 'blue' } }}>
          <span data-testid="inner" />
        </ThemeProvider>
      </ThemeProvider>
    );
    // The inner ThemeProvider wrapper is the second div
    const innerWrapper = container.querySelector('[data-zp-theme]') as HTMLElement;
    // Find the innermost wrapper
    const outerWrapper = container.children[0] as HTMLElement;
    const innerDiv = outerWrapper.children[0] as HTMLElement;

    // The inner wrapper should have both parent's and child's custom vars
    expect(innerDiv.style.getPropertyValue('--custom-parent')).toBe('red');
    expect(innerDiv.style.getPropertyValue('--custom-child')).toBe('blue');
  });

  it('inner provider child cssVars override parent cssVars for the same key', () => {
    const { container } = render(
      <ThemeProvider theme={{ cssVars: { '--custom-color': 'red' } }}>
        <ThemeProvider theme={{ cssVars: { '--custom-color': 'blue' } }}>
          <span />
        </ThemeProvider>
      </ThemeProvider>
    );
    const outerWrapper = container.children[0] as HTMLElement;
    const innerDiv = outerWrapper.children[0] as HTMLElement;
    expect(innerDiv.style.getPropertyValue('--custom-color')).toBe('blue');
  });

  it('deeply nested provider inherits correct semantic tokens', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={{ mode: 'dark' }}>
        <ThemeProvider theme={{ density: 'compact' }}>{children}</ThemeProvider>
      </ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    // Inner provider should have dark mode AND compact density
    expect(result.current.mode).toBe('dark');
    expect(result.current.density).toBe('compact');
  });

  it('inner provider tracks parent mode changes dynamically', () => {
    let setParentMode: ((m: import('./ThemeProvider').ColorMode) => void) | null = null;

    const Parent = ({ children }: { children: React.ReactNode }) => {
      const [mode, setMode] = React.useState<import('./ThemeProvider').ColorMode>('dark');
      setParentMode = setMode;
      return <ThemeProvider theme={{ mode }}>{children}</ThemeProvider>;
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Parent>
        {/* Inner provider with no explicit mode — should track the parent */}
        <ThemeProvider>{children}</ThemeProvider>
      </Parent>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.mode).toBe('dark');

    act(() => setParentMode!('light'));
    expect(result.current.mode).toBe('light');
  });
});

// ── SSR safety (no window) ────────────────────────────────────────────────────

describe('SSR safety', () => {
  it('getColorModeScript returns a string', () => {
    const script = getColorModeScript({ storageKey: 'theme' });
    expect(typeof script).toBe('string');
    expect(script).toContain('localStorage');
    expect(script).toContain('data-zp-theme');
  });

  it('getColorModeScript respects defaultMode', () => {
    const script = getColorModeScript({ storageKey: 'theme', defaultMode: 'dark' });
    expect(script).toContain('"dark"');
  });

  it('getColorModeScript uses sessionStorage when specified', () => {
    const script = getColorModeScript({
      storageKey: 'theme',
      storage: 'sessionStorage',
    });
    expect(script).toContain('sessionStorage');
  });

  it('getColorModeScript handles "system" defaultMode', () => {
    const script = getColorModeScript({ storageKey: 'theme', defaultMode: 'system' });
    expect(script).toContain('prefers-color-scheme: dark');
  });

  it('getColorModeScript does NOT check prefers-contrast by default', () => {
    const script = getColorModeScript({ storageKey: 'theme', defaultMode: 'system' });
    expect(script).not.toContain('prefers-contrast');
  });

  it('getColorModeScript checks prefers-contrast when detectHighContrast=true', () => {
    const script = getColorModeScript({
      storageKey: 'theme',
      defaultMode: 'system',
      detectHighContrast: true,
    });
    expect(script).toContain('prefers-contrast: more');
    expect(script).toContain('highContrast');
  });
});

// ── useReducedMotion ──────────────────────────────────────────────────────────

describe('useReducedMotion', () => {
  let mql: MockMql;
  let restoreMatchMedia: () => void;

  beforeEach(() => {
    mql = makeMockMql(false);
    restoreMatchMedia = installMatchMedia((query) =>
      query === '(prefers-reduced-motion: reduce)' ? mql : makeMockMql(false)
    );
  });

  afterEach(() => {
    restoreMatchMedia();
  });

  it('returns false when prefers-reduced-motion is not set', () => {
    mql.matches = false;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when prefers-reduced-motion: reduce is set', () => {
    mql.matches = true;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    mql.matches = false;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => mql._fire(true));
    expect(result.current).toBe(true);

    act(() => mql._fire(false));
    expect(result.current).toBe(false);
  });
});

// ── mqlHelpers legacy addListener fallback ────────────────────────────────────

import { mqlAddListener, mqlRemoveListener } from './mqlHelpers';

describe('mqlHelpers', () => {
  it('mqlAddListener uses addEventListener when available', () => {
    const mql = makeMockMql(false);
    const handler = vi.fn();
    mqlAddListener(mql as unknown as MediaQueryList, handler);
    expect(mql.addEventListener).toHaveBeenCalledWith('change', handler);
  });

  it('mqlRemoveListener uses removeEventListener when available', () => {
    const mql = makeMockMql(false);
    const handler = vi.fn();
    mqlRemoveListener(mql as unknown as MediaQueryList, handler);
    expect(mql.removeEventListener).toHaveBeenCalledWith('change', handler);
  });

  it('mqlAddListener falls back to addListener on legacy MQL', () => {
    const mql = makeLegacyMockMql(false);
    const handler = vi.fn();
    mqlAddListener(mql as unknown as MediaQueryList, handler);
    expect(mql.addListener).toHaveBeenCalledWith(handler);
  });

  it('mqlRemoveListener falls back to removeListener on legacy MQL', () => {
    const mql = makeLegacyMockMql(false);
    const handler = vi.fn();
    mqlRemoveListener(mql as unknown as MediaQueryList, handler);
    expect(mql.removeListener).toHaveBeenCalledWith(handler);
  });

  it('legacy addListener receives change events', () => {
    const mql = makeLegacyMockMql(false);
    const handler = vi.fn();
    mqlAddListener(mql as unknown as MediaQueryList, handler);

    act(() => mql._fire(true));
    expect(handler).toHaveBeenCalledWith({ matches: true });
  });
});
