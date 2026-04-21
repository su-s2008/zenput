/**
 * z-index layering tokens. Use these instead of raw numeric literals so
 * stacking contexts stay consistent across overlays.
 */
export const zIndex = {
  hide: -1,
  base: 0,
  raised: 1,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

export type ZIndexToken = keyof typeof zIndex;
