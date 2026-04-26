/**
 * Density tokens for compact/normal/spacious layouts.
 * These affect spacing scale multipliers for component sizing.
 */

export type DensityScale = 'compact' | 'normal' | 'spacious';

export interface DensityTokens {
  /** Spacing scale multiplier for this density level */
  scale: number;
  /** Padding for small components */
  paddingSm: string;
  /** Padding for medium components */
  paddingMd: string;
  /** Padding for large components */
  paddingLg: string;
  /** Gap between elements */
  gap: string;
  /** Minimum touch target size */
  minHeight: string;
}

export const densityTokens: Record<DensityScale, DensityTokens> = {
  compact: {
    scale: 0.75,
    paddingSm: '0.375rem', // 6px
    paddingMd: '0.5rem', // 8px
    paddingLg: '0.625rem', // 10px
    gap: '0.25rem', // 4px
    minHeight: '2rem', // 32px
  },
  normal: {
    scale: 1.0,
    paddingSm: '0.5rem', // 8px
    paddingMd: '0.75rem', // 12px
    paddingLg: '1rem', // 16px
    gap: '0.5rem', // 8px
    minHeight: '2.5rem', // 40px
  },
  spacious: {
    scale: 1.25,
    paddingSm: '0.75rem', // 12px
    paddingMd: '1rem', // 16px
    paddingLg: '1.25rem', // 20px
    gap: '0.75rem', // 12px
    minHeight: '3rem', // 48px
  },
};
