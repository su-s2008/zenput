/**
 * Typography tokens: font families, sizes, weights, line heights and
 * letter spacing. Font-size keys map to T-shirt sizes that components
 * can reference (e.g. `Text` uses `md` by default).
 */

export const fontFamilies = {
  sans: `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif`,
  serif: `Georgia, 'Times New Roman', Times, serif`,
  mono: `'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace`,
} as const;

export type FontFamilyToken = keyof typeof fontFamilies;

export const fontSizes = {
  xs: '0.75rem', // 12
  sm: '0.875rem', // 14
  md: '1rem', // 16
  lg: '1.125rem', // 18
  xl: '1.25rem', // 20
  '2xl': '1.5rem', // 24
  '3xl': '1.875rem', // 30
  '4xl': '2.25rem', // 36
  '5xl': '3rem', // 48
} as const;

export type FontSizeToken = keyof typeof fontSizes;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export type FontWeightToken = keyof typeof fontWeights;

export const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
} as const;

export type LineHeightToken = keyof typeof lineHeights;

export const letterSpacings = {
  tight: '-0.01em',
  normal: '0',
  wide: '0.02em',
  wider: '0.04em',
} as const;

export type LetterSpacingToken = keyof typeof letterSpacings;
