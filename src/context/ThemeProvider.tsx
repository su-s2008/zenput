'use client';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  CSSProperties,
} from 'react';
import {
  buildCssVariables,
  cssVar,
  semanticByMode,
  SemanticColors,
  ThemeMode,
  DensityScale,
  ComponentTokensMap,
} from '../tokens';
import { mqlAddListener, mqlRemoveListener } from './mqlHelpers';

/**
 * User-facing color mode. Extends {@link ThemeMode} with `'system'`,
 * which resolves to `'light'` or `'dark'` based on the OS preference.
 */
export type ColorMode = ThemeMode | 'system';

/**
 * Theme override shape.
 *
 * Back-compatible keys (primaryColor, errorColor, …) from Zenput 1.x are
 * preserved and continue to emit the original `--input-*` CSS variables
 * consumed by the form-input components.
 *
 * Additional properties (`mode`, `semantic`, `cssVars`, `density`,
 * `components`) opt into the full design-system token surface
 * (`--zp-*` CSS variables).
 */
export interface Theme {
  // ---- Legacy 1.x overrides (still supported) ----
  primaryColor?: string;
  errorColor?: string;
  successColor?: string;
  warningColor?: string;
  borderRadius?: string;
  fontFamily?: string;
  fontSize?: string;
  borderColor?: string;
  bgColor?: string;
  textColor?: string;
  placeholderColor?: string;
  focusRingColor?: string;
  disabledBg?: string;
  disabledText?: string;

  // ---- Design-system overrides ----
  /**
   * Theme mode. Default: `'light'`.
   * Use `'system'` to follow the OS `prefers-color-scheme` preference.
   */
  mode?: ColorMode;
  /** Partial overrides on top of the mode's semantic palette. */
  semantic?: Partial<SemanticColors>;
  /** Density scale for component sizing. Default: `'normal'`. */
  density?: DensityScale;
  /** Per-component token overrides. */
  components?: ComponentTokensMap;
  /**
   * Arbitrary extra CSS custom properties to merge in (e.g. custom
   * per-brand variables). Keys should include their leading `--`.
   */
  cssVars?: Record<string, string>;
}

/** Text direction. Matches the HTML `dir` attribute values. */
export type Direction = 'ltr' | 'rtl' | 'auto';

/** Value returned by {@link useColorMode}. */
export interface ColorModeContextValue {
  /** The user-selected mode (may be `'system'`). */
  mode: ColorMode;
  /** The actual applied mode after resolving `'system'`. */
  resolvedMode: ThemeMode;
  /** Set a new color mode (persists to storage if `storageKey` is set). */
  setMode: (mode: ColorMode) => void;
  /** Toggle between `'light'` and `'dark'`. */
  toggle: () => void;
}

/**
 * Public shape of the theme context returned by {@link useTheme}.
 */
export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  semantic: SemanticColors;
  density: DensityScale;
  components: ComponentTokensMap;
  cssVars: Record<string, string>;
  /** Text direction applied to the ThemeProvider wrapper. */
  dir: Direction;
}

/** @internal — extends the public ThemeContextValue with the _hasProvider
 *  sentinel used by nested ThemeProviders to detect nesting. */
interface InternalThemeContextValue extends ThemeContextValue {
  _hasProvider: boolean;
}

const defaultMode: ThemeMode = 'light';
const defaultDensity: DensityScale = 'normal';
const defaultSemantic = semanticByMode[defaultMode];
const defaultComponents: ComponentTokensMap = {};
const defaultCssVars = buildCssVariables(defaultSemantic, defaultDensity, defaultComponents);

const ThemeContext = createContext<InternalThemeContextValue>({
  theme: {},
  mode: defaultMode,
  semantic: defaultSemantic,
  density: defaultDensity,
  components: defaultComponents,
  cssVars: defaultCssVars,
  dir: 'ltr',
  _hasProvider: false,
});

const defaultColorModeContextValue: ColorModeContextValue = {
  mode: 'light',
  resolvedMode: 'light',
  setMode: () => {},
  toggle: () => {},
};

const ColorModeContext = createContext<ColorModeContextValue>(defaultColorModeContextValue);

const VALID_COLOR_MODES: ReadonlySet<string> = new Set<ColorMode>([
  'light',
  'dark',
  'highContrast',
  'system',
]);

function isValidColorMode(value: string): value is ColorMode {
  return VALID_COLOR_MODES.has(value);
}

function getStorageApi(type: 'localStorage' | 'sessionStorage'): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window[type];
  } catch {
    return null;
  }
}

/**
 * Safely read a value from Web Storage, returning `null` on any error
 * (e.g. Safari Private Mode raises a `SecurityError` on `getItem`).
 */
function safeStorageGet(
  storageType: 'localStorage' | 'sessionStorage',
  key: string
): string | null {
  try {
    return getStorageApi(storageType)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** Read the OS dark-mode preference safely (returns false in SSR). */
function matchesDarkScheme(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

/** Read the OS high-contrast preference safely (returns false in SSR). */
function matchesHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(prefers-contrast: more)').matches;
  } catch {
    return false;
  }
}

/**
 * Resolve a user-selected `ColorMode` to the `ThemeMode` actually applied.
 *
 * Keep in sync with the inline script produced by `getColorModeScript`.
 *
 * @param mode - User-selected mode (may be `'system'`).
 * @param systemDark - Whether the OS prefers dark.
 * @param systemHighContrast - Whether the OS prefers high contrast AND
 *   `detectHighContrast` is enabled.
 */
export function resolveColorMode(
  mode: ColorMode,
  systemDark: boolean,
  systemHighContrast: boolean
): ThemeMode {
  if (mode !== 'system') return mode;
  if (systemHighContrast) return 'highContrast';
  return systemDark ? 'dark' : 'light';
}

/**
 * Create a resolved theme object. Accepts partial overrides and falls
 * back to the mode's default semantic palette.
 *
 * **Note:** `theme.mode` must be a resolved {@link ThemeMode} (not
 * `'system'`). If `'system'` is passed it is treated as `'light'` (the
 * SSR-safe default). In practice `ThemeProvider` always passes the
 * resolved mode, so callers using this function directly should pass a
 * concrete `ThemeMode`.
 */
export function createTheme(theme: Omit<Theme, 'mode'> & { mode?: ThemeMode } = {}): {
  mode: ThemeMode;
  semantic: SemanticColors;
  density: DensityScale;
  components: ComponentTokensMap;
  cssVars: Record<string, string>;
} {
  const mode: ThemeMode = theme.mode ?? defaultMode;
  const density = theme.density ?? defaultDensity;
  const components = theme.components ?? defaultComponents;
  const semantic: SemanticColors = {
    ...semanticByMode[mode],
    ...theme.semantic,
  };
  const cssVars: Record<string, string> = {
    ...buildCssVariables(semantic, density, components),
    ...theme.cssVars,
  };
  return { mode, semantic, density, components, cssVars };
}

/**
 * Map legacy (1.x) theme fields onto the original `--input-*` CSS
 * variables so existing form inputs keep working unchanged.
 */
function legacyCssVars(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {};
  if (theme.primaryColor) vars['--input-primary-color'] = theme.primaryColor;
  if (theme.errorColor) vars['--input-error-color'] = theme.errorColor;
  if (theme.successColor) vars['--input-success-color'] = theme.successColor;
  if (theme.warningColor) vars['--input-warning-color'] = theme.warningColor;
  if (theme.borderRadius) vars['--input-border-radius'] = theme.borderRadius;
  if (theme.fontFamily) vars['--input-font-family'] = theme.fontFamily;
  if (theme.fontSize) vars['--input-font-size'] = theme.fontSize;
  if (theme.borderColor) vars['--input-border-color'] = theme.borderColor;
  if (theme.bgColor) vars['--input-bg-color'] = theme.bgColor;
  if (theme.textColor) vars['--input-text-color'] = theme.textColor;
  if (theme.placeholderColor) vars['--input-placeholder-color'] = theme.placeholderColor;
  if (theme.focusRingColor) vars['--input-focus-ring-color'] = theme.focusRingColor;
  if (theme.disabledBg) vars['--input-disabled-bg'] = theme.disabledBg;
  if (theme.disabledText) vars['--input-disabled-text'] = theme.disabledText;
  return vars;
}

interface ThemeProviderProps {
  theme?: Theme;
  /**
   * Element type for the wrapper element. Defaults to "div".
   * Note: The wrapper element is required to scope CSS custom properties
   * (design tokens) to descendant components, but may impact layout if you
   * expect the provider to be transparent. Choose an appropriate element
   * (e.g., "span" for inline contexts) or ensure your layout accounts for
   * the wrapper.
   */
  as?: keyof React.JSX.IntrinsicElements | React.ElementType;
  /**
   * Text direction for all descendant components. Mirrors the HTML `dir`
   * attribute and is exposed via the `useDirection()` hook so components
   * can adapt their layout and keyboard interactions.
   *
   * - `'ltr'` — left-to-right (default)
   * - `'rtl'` — right-to-left (Arabic, Hebrew, Persian, Urdu, …)
   * - `'auto'` — browser auto-detection based on content
   */
  dir?: Direction;
  children: React.ReactNode;
  /**
   * When set, the user-selected color mode (which may be `'system'`) is
   * persisted to storage under this key and rehydrated on mount, taking
   * priority over `theme.mode`. Works with `mode="system"`.
   */
  storageKey?: string;
  /**
   * Which Web Storage API to use for persistence. Default: `'localStorage'`.
   */
  storage?: 'localStorage' | 'sessionStorage';
  /**
   * When `true`, automatically switches to `'highContrast'` mode when the
   * OS `prefers-contrast: more` media feature is active and
   * `mode="system"`.
   */
  detectHighContrast?: boolean;
}

/** Referentially-stable default theme so consumers that omit `theme`
 * don't invalidate memoization on every render. */
const EMPTY_THEME: Theme = Object.freeze({}) as Theme;

export function ThemeProvider({
  theme = EMPTY_THEME,
  as = 'div',
  dir = 'ltr',
  children,
  storageKey,
  storage = 'localStorage',
  detectHighContrast = false,
}: Readonly<ThemeProviderProps>): React.JSX.Element {
  // ── Detect parent context (for nested providers) ───────────────────
  const parentCtx = useContext(ThemeContext);
  const isNested = parentCtx._hasProvider;

  // ── User mode override ─────────────────────────────────────────────
  // Track an explicit user-selected mode (from storage or setMode calls).
  // When null, the effective color mode falls through to theme.mode or the
  // parent provider's resolved mode.
  const [userMode, setUserMode] = useState<ColorMode | null>(() => {
    if (storageKey) {
      // safeStorageGet wraps getItem in try/catch so it never throws
      // even in environments like Safari Private Mode.
      const stored = safeStorageGet(storage, storageKey);
      if (stored && isValidColorMode(stored)) return stored;
    }
    return null;
  });

  // ── Effective color mode (derived, no effect needed) ──────────────
  // Priority: explicit user override → theme.mode prop → parent's resolved
  // mode (reactive) → 'light'.
  // Deriving from parentCtx.mode makes nested providers automatically track
  // parent mode changes without any extra effects or state.
  const colorMode: ColorMode =
    userMode ?? theme.mode ?? (isNested ? parentCtx.mode : 'light');

  // ── System preference detection ────────────────────────────────────
  const [systemDark, setSystemDark] = useState<boolean>(matchesDarkScheme);

  // Track systemHighContrast as state so event-listener updates trigger
  // re-renders. The state is initialized from the OS value when
  // detectHighContrast is true, and updated via the event listener below.
  const [systemHighContrast, setSystemHighContrast] = useState<boolean>(() =>
    detectHighContrast ? matchesHighContrast() : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let darkMql: MediaQueryList | undefined;
    let contrastMql: MediaQueryList | undefined;
    let onDarkChange: ((e: MediaQueryListEvent) => void) | undefined;
    let onContrastChange: ((e: MediaQueryListEvent) => void) | undefined;

    try {
      darkMql = window.matchMedia('(prefers-color-scheme: dark)');
      onDarkChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
      mqlAddListener(darkMql, onDarkChange);

      if (detectHighContrast) {
        contrastMql = window.matchMedia('(prefers-contrast: more)');
        onContrastChange = (e: MediaQueryListEvent) => setSystemHighContrast(e.matches);
        mqlAddListener(contrastMql, onContrastChange);
      }

      return () => {
        if (darkMql && onDarkChange) mqlRemoveListener(darkMql, onDarkChange);
        if (contrastMql && onContrastChange) mqlRemoveListener(contrastMql, onContrastChange);
      };
    } catch {
      // matchMedia not available (old browser, test env, etc.)
      return undefined;
    }
  }, [detectHighContrast]);

  // ── Resolve the actual ThemeMode ──────────────────────────────────
  // `systemHighContrast` state is kept in sync via the event listener for
  // ongoing OS changes. We also call `matchesHighContrast()` directly here
  // to cover the one-render window when `detectHighContrast` transitions
  // false → true: the effect hasn't subscribed yet so the state may still
  // be false while the OS has high contrast active. Once the effect fires
  // and the event listener is registered, all future changes go through
  // `systemHighContrast` state. The extra matchMedia read is negligible
  // since useMemo only recomputes when its dependencies change.
  const resolvedMode = useMemo<ThemeMode>(
    () =>
      resolveColorMode(
        colorMode,
        systemDark,
        detectHighContrast && (systemHighContrast || matchesHighContrast())
      ),
    [colorMode, systemDark, systemHighContrast, detectHighContrast]
  );

  // ── Build CSS variables for the resolved mode ─────────────────────
  const { semantic, density, components, cssVars: rawCssVars } = useMemo(
    () => createTheme({ ...theme, mode: resolvedMode }),
    [theme, resolvedMode]
  );

  const legacy = useMemo(() => legacyCssVars(theme), [theme]);

  // Merge: parent cssVars first (lowest priority), then child, then legacy
  const mergedVars = useMemo(
    () => ({
      ...(isNested ? parentCtx.cssVars : {}),
      ...rawCssVars,
      ...legacy,
    }),
    [isNested, parentCtx.cssVars, rawCssVars, legacy]
  );

  // ── Color mode control API ─────────────────────────────────────────
  const setMode = useCallback(
    (next: ColorMode) => {
      setUserMode(next);
      if (storageKey) {
        try {
          getStorageApi(storage)?.setItem(storageKey, next);
        } catch {
          // storage quota or security error — silently ignore
        }
      }
    },
    [storageKey, storage]
  );

  const toggle = useCallback(() => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark');
  }, [setMode, resolvedMode]);

  const colorModeValue = useMemo<ColorModeContextValue>(
    () => ({ mode: colorMode, resolvedMode, setMode, toggle }),
    [colorMode, resolvedMode, setMode, toggle]
  );

  // ── Theme context value ────────────────────────────────────────────
  const contextValue = useMemo<InternalThemeContextValue>(
    () => ({
      theme,
      mode: resolvedMode,
      semantic,
      density,
      components,
      cssVars: mergedVars,
      dir,
      _hasProvider: true,
    }),
    [theme, resolvedMode, semantic, density, components, mergedVars, dir]
  );

  const WrapperComponent = as as React.ElementType;

  return (
    <ThemeContext.Provider value={contextValue}>
      <ColorModeContext.Provider value={colorModeValue}>
        <WrapperComponent data-zp-theme={resolvedMode} dir={dir} style={mergedVars as CSSProperties}>
          {children}
        </WrapperComponent>
      </ColorModeContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/**
 * Returns the text direction (`'ltr'`, `'rtl'`, or `'auto'`) from the
 * nearest `ThemeProvider`. Defaults to `'ltr'` when used outside a provider.
 *
 * Use this hook in components that need to adapt their layout, icon
 * orientation, or keyboard interactions based on the reading direction.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const dir = useDirection();
 *   const isRtl = dir === 'rtl';
 *   return <div style={{ marginInlineStart: isRtl ? '1rem' : undefined }}>…</div>;
 * }
 * ```
 */
export function useDirection(): Direction {
  return useContext(ThemeContext).dir;
}

/**
 * Access and control the current color mode.
 *
 * Returns `{ mode, resolvedMode, setMode, toggle }`.
 * - `mode` — the user-selected mode (may be `'system'`).
 * - `resolvedMode` — the actual applied mode (`'light' | 'dark' | 'highContrast'`).
 * - `setMode(mode)` — change the mode (persists if `storageKey` was provided).
 * - `toggle()` — toggle between `'light'` and `'dark'`.
 */
export function useColorMode(): ColorModeContextValue {
  return useContext(ColorModeContext);
}

/**
 * Resolve a token reference to its CSS `var(...)` expression.
 *
 * Delegates to {@link cssVar} so spacing keys with decimals (e.g.
 * `space-0.5`) are normalized to the same dash form used in the emitted
 * CSS custom-property names (e.g. `--zp-space-0-5`).
 *
 * Examples:
 *   tokenVar('color-brand')             -> 'var(--zp-color-brand)'
 *   tokenVar('space-4')                 -> 'var(--zp-space-4)'
 *   tokenVar('space-0.5')               -> 'var(--zp-space-0-5)'
 *   tokenVar('color-brand', '#0000ff')  -> 'var(--zp-color-brand, #0000ff)'
 */
export function tokenVar(name: string, fallback?: string): string {
  // Context is intentionally not read: CSS variables are scoped via the
  // ThemeProvider wrapper element, and `var(...)` just references them.
  return cssVar(name, fallback);
}
