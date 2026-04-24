/**
 * z-index layering tokens. Use these instead of raw numeric literals so
 * stacking contexts stay consistent across overlays.
 */
export const zIndex = {
  hide: -1,
  base: 0,
  raised: 1,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipNav: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

export type ZIndexToken = keyof typeof zIndex;
