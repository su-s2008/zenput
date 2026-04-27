/**
 * Semantic typography presets.
 *
 * Each preset is a flat style object referencing the underlying token CSS
 * variables. Components and consumers can apply these directly via the
 * `style` prop or via the generated `.zp-text-*` CSS utility classes
 * (see `src/styles/typography.css`).
 *
 * Generated CSS custom properties are NOT emitted for presets (they are
 * multi-property objects, not scalar values). Use the preset objects in JS
 * or the utility classes in CSS.
 */

export interface TypographyPreset {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  textTransform?: string;
}

const sans = 'var(--zp-font-family-sans)';
const mono = 'var(--zp-font-family-mono)';

function createPreset(
  fontSize: string,
  fontWeight: string,
  lineHeight: string,
  letterSpacing: string,
  fontFamily = sans
): TypographyPreset {
  return { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing };
}

// Shorthand aliases for repeated token values.
const bold = 'var(--zp-font-weight-bold)';
const semibold = 'var(--zp-font-weight-semibold)';
const regular = 'var(--zp-font-weight-regular)';
const tight = 'var(--zp-line-height-tight)';
const snug = 'var(--zp-line-height-snug)';
const normal = 'var(--zp-line-height-normal)';
const relaxed = 'var(--zp-line-height-relaxed)';
const lsTight = 'var(--zp-letter-spacing-tight)';
const lsNormal = 'var(--zp-letter-spacing-normal)';
const lsWide = 'var(--zp-letter-spacing-wide)';
const lsWider = 'var(--zp-letter-spacing-wider)';

export const typographyPresets = {
  'display-lg': createPreset('var(--zp-font-size-5xl)', bold, tight, lsTight),
  'display-md': createPreset('var(--zp-font-size-4xl)', bold, tight, lsTight),
  'heading-1': createPreset('var(--zp-font-size-3xl)', bold, tight, lsTight),
  'heading-2': createPreset('var(--zp-font-size-2xl)', semibold, snug, lsTight),
  'heading-3': createPreset('var(--zp-font-size-xl)', semibold, snug, lsNormal),
  'heading-4': createPreset('var(--zp-font-size-lg)', semibold, snug, lsNormal),
  'heading-5': createPreset('var(--zp-font-size-md)', semibold, normal, lsNormal),
  'heading-6': createPreset('var(--zp-font-size-sm)', semibold, normal, lsWide),
  'body-lg': createPreset('var(--zp-font-size-lg)', regular, relaxed, lsNormal),
  'body-md': createPreset('var(--zp-font-size-md)', regular, normal, lsNormal),
  'body-sm': createPreset('var(--zp-font-size-sm)', regular, normal, lsNormal),
  caption: createPreset('var(--zp-font-size-xs)', regular, normal, lsNormal),
  overline: { ...createPreset('var(--zp-font-size-xs)', semibold, normal, lsWider), textTransform: 'uppercase' },
  code: createPreset('var(--zp-font-size-sm)', regular, relaxed, lsNormal, mono),
} as const satisfies Record<string, TypographyPreset>;

export type TypographyPresetName = keyof typeof typographyPresets;

