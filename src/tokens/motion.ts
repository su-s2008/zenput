/**
 * Motion tokens: durations and easing curves for transitions.
 */
export const durations = {
  instant: '0ms',
  fast: '100ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
  shimmer: '1500ms',
  spin: '600ms',
} as const;

export type DurationToken = keyof typeof durations;

export const easings = {
  linear: 'linear',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  /** Overshoot spring — use for playful entrance animations (e.g. popover open). */
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export type EasingToken = keyof typeof easings;
