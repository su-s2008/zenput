/**
 * Static focus-ring tokens used to build a consistent `:focus-visible`
 * outline across all interactive elements.
 *
 * The colour is intentionally expressed as a `var()` reference so it
 * automatically tracks the semantic `--zp-color-focus-ring` token that
 * ThemeProvider updates per mode (light / dark / highContrast).
 *
 * Usage in CSS:
 *   outline: var(--zp-focus-ring-width) var(--zp-focus-ring-style) var(--zp-focus-ring-color);
 *   outline-offset: var(--zp-focus-ring-offset);
 */
export const focusRingTokens = {
  width: '2px',
  offset: '2px',
  style: 'solid',
  color: 'var(--zp-color-focus-ring)',
} as const;

export type FocusRingToken = keyof typeof focusRingTokens;
