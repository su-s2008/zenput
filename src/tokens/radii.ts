export const radii = {
  none: '0',
  sm: '2px',
  md: '4px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
  /** Alias for `full` — use for pill-shaped buttons and badges. */
  pill: '9999px',
  /** Alias for `lg` — standard corner radius for Card surfaces. */
  card: '8px',
} as const;

export type RadiusToken = keyof typeof radii;
