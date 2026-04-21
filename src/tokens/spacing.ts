/**
 * 4-point spacing scale (doubles as 8-point when using the even steps).
 * Keys are numeric step identifiers. Values are rem strings.
 */
export const spacing = {
  '0': '0',
  '0.5': '0.125rem', // 2
  '1': '0.25rem', // 4
  '1.5': '0.375rem', // 6
  '2': '0.5rem', // 8
  '2.5': '0.625rem', // 10
  '3': '0.75rem', // 12
  '4': '1rem', // 16
  '5': '1.25rem', // 20
  '6': '1.5rem', // 24
  '8': '2rem', // 32
  '10': '2.5rem', // 40
  '12': '3rem', // 48
  '16': '4rem', // 64
  '20': '5rem', // 80
  '24': '6rem', // 96
} as const;

export type SpacingToken = keyof typeof spacing;
