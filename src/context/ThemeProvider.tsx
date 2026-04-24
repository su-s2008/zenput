import React, { createContext, useContext, useMemo, CSSProperties } from 'react';
import {
  buildCssVariables,
  cssVar,
  semanticByMode,
  SemanticColors,
  ThemeMode,
  DensityScale,
  ComponentTokensMap,
} from '../tokens';

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
  /** Theme mode. Default: `'light'`. */
  mode?: ThemeMode;
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

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  semantic: SemanticColors;
  density: DensityScale;
  components: ComponentTokensMap;
  cssVars: Record<string, string>;
}

const defaultMode: ThemeMode = 'light';
const defaultDensity: DensityScale = 'normal';
const defaultSemantic = semanticByMode[defaultMode];
const defaultComponents: ComponentTokensMap = {};
const defaultCssVars = buildCssVariables(defaultSemantic, defaultDensity, defaultComponents);

const ThemeContext = createContext<ThemeContextValue>({
  theme: {},
  mode: defaultMode,
  semantic: defaultSemantic,
  density: defaultDensity,
  components: defaultComponents,
  cssVars: defaultCssVars,
});

/**
 * Create a resolved theme object. Accepts partial overrides and falls
 * back to the mode's default semantic palette.
 */
export function createTheme(theme: Theme = {}): {
  mode: ThemeMode;
  semantic: SemanticColors;
  density: DensityScale;
  components: ComponentTokensMap;
  cssVars: Record<string, string>;
} {
  const mode = theme.mode ?? defaultMode;
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
  children: React.ReactNode;
}

/** Referentially-stable default theme so consumers that omit `theme`
 * don't invalidate memoization on every render. */
const EMPTY_THEME: Theme = Object.freeze({}) as Theme;

export function ThemeProvider({
  theme = EMPTY_THEME,
  as = 'div',
  children,
}: Readonly<ThemeProviderProps>): React.JSX.Element {
  const { mode, semantic, density, components, cssVars } = useMemo(
    () => createTheme(theme),
    [theme]
  );
  const legacy = useMemo(() => legacyCssVars(theme), [theme]);

  const mergedVars = useMemo(() => ({ ...cssVars, ...legacy }), [cssVars, legacy]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({ theme, mode, semantic, density, components, cssVars: mergedVars }),
    [theme, mode, semantic, density, components, mergedVars]
  );

  const WrapperComponent = as as React.ElementType;

  return (
    <ThemeContext.Provider value={contextValue}>
      <WrapperComponent data-zp-theme={mode} style={mergedVars as CSSProperties}>
        {children}
      </WrapperComponent>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
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
