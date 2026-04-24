/**
 * Color palette tokens.
 *
 * A color ramp is a record keyed by steps 50..900 following the common
 * Tailwind-like scale. Semantic tokens (`brand`, `success`, `warning`, etc.)
 * are aliased to a particular ramp but can be overridden per theme.
 */

export type ColorScaleStep =
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export type ColorScale = Record<ColorScaleStep, string>;

export const neutral: ColorScale = {
  '50': '#f9fafb',
  '100': '#f3f4f6',
  '200': '#e5e7eb',
  '300': '#d1d5db',
  '400': '#9ca3af',
  '500': '#6b7280',
  '600': '#4b5563',
  '700': '#374151',
  '800': '#1f2937',
  '900': '#111827',
};

export const blue: ColorScale = {
  '50': '#eff6ff',
  '100': '#dbeafe',
  '200': '#bfdbfe',
  '300': '#93c5fd',
  '400': '#60a5fa',
  '500': '#3b82f6',
  '600': '#2563eb',
  '700': '#1d4ed8',
  '800': '#1e40af',
  '900': '#1e3a8a',
};

export const green: ColorScale = {
  '50': '#f0fdf4',
  '100': '#dcfce7',
  '200': '#bbf7d0',
  '300': '#86efac',
  '400': '#4ade80',
  '500': '#22c55e',
  '600': '#16a34a',
  '700': '#15803d',
  '800': '#166534',
  '900': '#14532d',
};

export const amber: ColorScale = {
  '50': '#fffbeb',
  '100': '#fef3c7',
  '200': '#fde68a',
  '300': '#fcd34d',
  '400': '#fbbf24',
  '500': '#f59e0b',
  '600': '#d97706',
  '700': '#b45309',
  '800': '#92400e',
  '900': '#78350f',
};

export const red: ColorScale = {
  '50': '#fef2f2',
  '100': '#fee2e2',
  '200': '#fecaca',
  '300': '#fca5a5',
  '400': '#f87171',
  '500': '#ef4444',
  '600': '#dc2626',
  '700': '#b91c1c',
  '800': '#991b1b',
  '900': '#7f1d1d',
};

export const cyan: ColorScale = {
  '50': '#ecfeff',
  '100': '#cffafe',
  '200': '#a5f3fc',
  '300': '#67e8f9',
  '400': '#22d3ee',
  '500': '#06b6d4',
  '600': '#0891b2',
  '700': '#0e7490',
  '800': '#155e75',
  '900': '#164e63',
};

export const palette = {
  neutral,
  blue,
  green,
  amber,
  red,
  cyan,
} as const;

export type Palette = typeof palette;

/**
 * Semantic color slots resolved against the palette for a given mode.
 */
export interface SemanticColors {
  /** Primary/brand background for filled buttons, focus rings, etc. */
  brand: string;
  brandHover: string;
  brandActive: string;
  brandSubtle: string;
  brandText: string;

  success: string;
  successSubtle: string;
  successText: string;

  warning: string;
  warningSubtle: string;
  warningText: string;

  danger: string;
  dangerHover: string;
  dangerActive: string;
  dangerSubtle: string;
  dangerText: string;

  info: string;
  infoSubtle: string;
  infoText: string;

  /** Canvas / surface backgrounds. */
  background: string;
  surface: string;
  surfaceRaised: string;
  surfaceOverlay: string;

  /** Text tones. */
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textInverse: string;

  /** Borders & dividers. */
  border: string;
  borderStrong: string;
  borderSubtle: string;

  /** Focus ring color. */
  focusRing: string;

  /** Backdrop / overlay background color (e.g. for Modal, Drawer backdrops). */
  overlay: string;
}

export const lightSemantic: SemanticColors = {
  brand: blue['600'],
  brandHover: blue['700'],
  brandActive: blue['800'],
  brandSubtle: blue['50'],
  brandText: blue['700'],

  success: green['600'],
  successSubtle: green['50'],
  successText: green['700'],

  warning: amber['500'],
  warningSubtle: amber['50'],
  warningText: amber['700'],

  danger: red['600'],
  dangerHover: red['700'],
  dangerActive: red['800'],
  dangerSubtle: red['50'],
  dangerText: red['700'],

  info: cyan['600'],
  infoSubtle: cyan['50'],
  infoText: cyan['700'],

  background: '#ffffff',
  surface: '#ffffff',
  surfaceRaised: '#ffffff',
  surfaceOverlay: 'rgba(17, 24, 39, 0.5)',

  textPrimary: neutral['900'],
  textSecondary: neutral['600'],
  textDisabled: '#6b7280', // neutral-500: muted gray for disabled text that still meets WCAG AA contrast; WHCM overrides apply when forced colors are active
  textInverse: '#ffffff',

  border: neutral['300'],
  borderStrong: neutral['400'],
  borderSubtle: neutral['200'],

  focusRing: blue['500'],

  overlay: 'rgba(17, 24, 39, 0.5)',
};

export const darkSemantic: SemanticColors = {
  brand: blue['400'],
  brandHover: blue['300'],
  brandActive: blue['200'],
  brandSubtle: 'rgba(59, 130, 246, 0.16)',
  brandText: blue['300'],

  success: green['400'],
  successSubtle: 'rgba(34, 197, 94, 0.16)',
  successText: green['300'],

  warning: amber['400'],
  warningSubtle: 'rgba(245, 158, 11, 0.16)',
  warningText: amber['300'],

  danger: red['400'],
  dangerHover: red['300'],
  dangerActive: red['200'],
  dangerSubtle: 'rgba(239, 68, 68, 0.16)',
  dangerText: red['300'],

  info: cyan['400'],
  infoSubtle: 'rgba(6, 182, 212, 0.16)',
  infoText: cyan['300'],

  background: '#0b0f17',
  surface: '#121826',
  surfaceRaised: '#1a2132',
  surfaceOverlay: 'rgba(0, 0, 0, 0.65)',

  textPrimary: neutral['50'],
  textSecondary: neutral['300'],
  textDisabled: '#6b7280', // neutral-500: muted gray for disabled text; WHCM overrides apply when forced colors are active
  textInverse: neutral['900'],

  border: neutral['700'],
  borderStrong: neutral['600'],
  borderSubtle: neutral['800'],

  focusRing: blue['400'],

  overlay: 'rgba(0, 0, 0, 0.6)',
};

/**
 * High-contrast semantics: pure black / saturated accents, intended
 * to meet Windows High Contrast and WCAG AAA expectations.
 */
export const highContrastSemantic: SemanticColors = {
  brand: '#1aebff',
  brandHover: '#ffffff',
  brandActive: '#ffff00',
  brandSubtle: '#000000',
  brandText: '#ffffff',

  success: '#3ff23f',
  successSubtle: '#000000',
  successText: '#ffffff',

  warning: '#ffff00',
  warningSubtle: '#000000',
  warningText: '#ffffff',

  danger: '#ff5f5f',
  dangerHover: '#ffffff',
  dangerActive: '#ffff00',
  dangerSubtle: '#000000',
  dangerText: '#ffffff',

  info: '#1aebff',
  infoSubtle: '#000000',
  infoText: '#ffffff',

  background: '#000000',
  surface: '#000000',
  surfaceRaised: '#000000',
  surfaceOverlay: 'rgba(0, 0, 0, 0.85)',

  textPrimary: '#ffffff',
  textSecondary: '#ffffff',
  textDisabled: '#3ff23f',
  textInverse: '#000000',

  border: '#ffffff',
  borderStrong: '#ffffff',
  borderSubtle: '#ffffff',

  focusRing: '#1aebff',

  overlay: 'rgba(0, 0, 0, 0.75)',
};
