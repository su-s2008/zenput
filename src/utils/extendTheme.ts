import { Theme } from '../context/ThemeProvider';
import { SemanticColors } from '../tokens/colors';
import { ComponentTokensMap } from '../tokens/components';

/**
 * Deep merge helper that properly merges nested objects.
 * Handles partial semantic colors and component token overrides.
 */
function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T {
  const result = { ...base };

  for (const key in override) {
    const overrideValue = override[key];
    const baseValue = base[key];

    if (
      overrideValue !== undefined &&
      typeof overrideValue === 'object' &&
      !Array.isArray(overrideValue) &&
      overrideValue !== null &&
      typeof baseValue === 'object' &&
      !Array.isArray(baseValue) &&
      baseValue !== null
    ) {
      // Recursively merge nested objects
      result[key] = deepMerge(
        baseValue as Record<string, unknown>,
        overrideValue as Record<string, unknown>
      ) as T[Extract<keyof T, string>];
    } else if (overrideValue !== undefined) {
      // Direct override for primitive values
      result[key] = overrideValue as T[Extract<keyof T, string>];
    }
  }

  return result;
}

/**
 * Extends a base theme with overrides. Performs deep merge for nested
 * properties like `semantic` colors and `components` tokens.
 *
 * This is the primary API for composing themes. Use it to create
 * variations of an existing theme or to layer multiple theme presets.
 *
 * @example
 * ```tsx
 * // Create a base brand theme
 * const brandTheme: Theme = {
 *   mode: 'light',
 *   semantic: {
 *     brand: '#6366f1',
 *     brandHover: '#4f46e5',
 *   },
 * };
 *
 * // Extend with dark mode
 * const darkBrandTheme = extendTheme(brandTheme, {
 *   mode: 'dark',
 *   semantic: {
 *     background: '#1e1e2e',
 *   },
 * });
 *
 * // Extend with component overrides
 * const customTheme = extendTheme(brandTheme, {
 *   density: 'compact',
 *   components: {
 *     button: {
 *       borderRadius: 'var(--zp-radius-full)',
 *     },
 *   },
 * });
 * ```
 *
 * @param base - Base theme to extend
 * @param overrides - Theme properties to override or add
 * @returns A new theme object with merged properties
 */
export function extendTheme(base: Theme, ...overrides: Array<Partial<Theme>>): Theme {
  let result: Theme = { ...base };

  for (const override of overrides) {
    // Capture prior accumulated values before spreading so deep-merge
    // layers correctly across multiple overrides (later overrides extend
    // earlier ones rather than only the original `base`).
    const prevSemantic = result.semantic;
    const prevComponents = result.components;
    const prevCssVars = result.cssVars;

    // Merge top-level properties
    result = {
      ...result,
      ...override,
    };

    // Deep merge semantic colors if either side defines them
    if (prevSemantic || override.semantic) {
      result.semantic = deepMerge(
        (prevSemantic || {}) as Record<string, unknown>,
        (override.semantic || {}) as Record<string, unknown>
      ) as unknown as SemanticColors;
    }

    // Deep merge component tokens if either side defines them
    if (prevComponents || override.components) {
      result.components = deepMerge(
        (prevComponents || {}) as Record<string, unknown>,
        (override.components || {}) as Record<string, unknown>
      ) as unknown as ComponentTokensMap;
    }

    // Merge CSS vars (shallow merge is fine for custom properties)
    if (prevCssVars || override.cssVars) {
      result.cssVars = {
        ...prevCssVars,
        ...override.cssVars,
      };
    }
  }

  return result;
}

/**
 * Creates a partial theme preset that can be composed with other themes.
 * This is useful for creating reusable theme fragments.
 *
 * @example
 * ```tsx
 * // Create a high-contrast preset
 * const highContrastPreset = createThemePreset({
 *   mode: 'highContrast',
 *   semantic: {
 *     focusRing: '#ffff00',
 *   },
 * });
 *
 * // Apply to any base theme
 * const accessibleTheme = extendTheme(baseTheme, highContrastPreset);
 * ```
 */
export function createThemePreset(preset: Partial<Theme>): Partial<Theme> {
  return preset;
}
