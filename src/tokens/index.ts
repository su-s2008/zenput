/**
 * Design-token entry point.
 *
 * Re-exports the raw token objects (colors, typography, spacing,
 * radii, shadows, motion, zIndex, breakpoints) and the helper that
 * converts a resolved token set into a flat `Record<string, string>`
 * of CSS custom properties consumed by the `ThemeProvider`.
 */
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radii';
export * from './shadows';
export * from './motion';
export * from './zIndex';
export * from './breakpoints';

import {
  SemanticColors,
  lightSemantic,
  darkSemantic,
  highContrastSemantic,
  palette,
} from './colors';
import { fontFamilies, fontSizes, fontWeights, lineHeights, letterSpacings } from './typography';
import { spacing } from './spacing';
import { radii } from './radii';
import { shadows, borderWidths, elevation } from './shadows';
import { durations, easings } from './motion';
import { zIndex } from './zIndex';
import { breakpoints } from './breakpoints';

export type ThemeMode = 'light' | 'dark' | 'highContrast';

/** CSS custom-property prefix used for all emitted tokens. */
export const CSS_VAR_PREFIX = '--zp';

export const semanticByMode: Record<ThemeMode, SemanticColors> = {
  light: lightSemantic,
  dark: darkSemantic,
  highContrast: highContrastSemantic,
};

function kebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** Spacing-token keys may contain dots (e.g. `"0.5"`), which are not
 * valid in CSS custom-property identifiers. Normalize to a dash form
 * when emitting/consuming the variable name (e.g. `"0.5"` → `"0-5"`).
 */
export function normalizeSpacingKey(key: string): string {
  return key.replace(/\./g, '-');
}

/**
 * Build the flat CSS-variable map for a given semantic palette and
 * the static token categories. Output keys are already prefixed with
 * {@link CSS_VAR_PREFIX}.
 */
export function buildCssVariables(semantic: SemanticColors): Record<string, string> {
  const vars: Record<string, string> = {};

  // Palette (useful for custom brand colors).
  for (const [ramp, scale] of Object.entries(palette)) {
    for (const [step, value] of Object.entries(scale)) {
      vars[`${CSS_VAR_PREFIX}-color-${ramp}-${step}`] = value;
    }
  }

  // Semantic colors use kebab-cased keys.
  assignTokens(vars, 'color', semantic, kebab);

  // Typography.
  assignTokens(vars, 'font-family', fontFamilies);
  assignTokens(vars, 'font-size', fontSizes);
  assignTokens(vars, 'font-weight', fontWeights);
  assignTokens(vars, 'line-height', lineHeights);
  assignTokens(vars, 'letter-spacing', letterSpacings);

  // Spacing uses a dash-normalized key so decimal steps remain valid
  // CSS custom-property identifiers (e.g. "0.5" -> "0-5").
  assignTokens(vars, 'space', spacing, normalizeSpacingKey);

  // Radii / borders / shadows / motion / zIndex / breakpoints / elevation.
  assignTokens(vars, 'radius', radii);
  assignTokens(vars, 'border-width', borderWidths);
  assignTokens(vars, 'shadow', shadows);
  assignTokens(vars, 'duration', durations);
  assignTokens(vars, 'easing', easings);
  assignTokens(vars, 'z', zIndex, kebab);
  assignTokens(vars, 'breakpoint', breakpoints);
  assignTokens(vars, 'elevation', elevation);

  // Overlay backdrop color — exposed as `--zp-overlay` (no category prefix).
  vars[`${CSS_VAR_PREFIX}-overlay`] = semantic.overlay;

  return vars;
}

/** Emit `${CSS_VAR_PREFIX}-${category}-${keyFn(key)}` entries for every
 * own property of `source`, coercing non-string values to string. */
function assignTokens(
  target: Record<string, string>,
  category: string,
  source: object,
  keyFn: (key: string) => string = (k) => k
): void {
  for (const [key, value] of Object.entries(source)) {
    target[`${CSS_VAR_PREFIX}-${category}-${keyFn(key)}`] = String(value);
  }
}

/**
 * Helper to reference a CSS variable by semantic key (typed).
 * Example: `cssVar('color-brand')` -> `var(--zp-color-brand)`.
 *
 * Numeric spacing keys with decimals are normalized to the same dash form
 * used by {@link buildCssVariables} (e.g. `space-0.5` -> `--zp-space-0-5`)
 * so callers can pass the raw token key without having to know the
 * normalization rules.
 */
export function cssVar(name: string, fallback?: string): string {
  const normalized = name.replace(/\./g, '-');
  return fallback
    ? `var(${CSS_VAR_PREFIX}-${normalized}, ${fallback})`
    : `var(${CSS_VAR_PREFIX}-${normalized})`;
}
