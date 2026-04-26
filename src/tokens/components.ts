/**
 * Per-component token definitions.
 *
 * Each component can define its own token overrides that are scoped
 * to that component. This allows for fine-grained theming control.
 */

export type ComponentTokens = Record<string, string | number>;

/**
 * Button component tokens
 */
export interface ButtonTokens {
  // Padding
  paddingSm?: string;
  paddingMd?: string;
  paddingLg?: string;
  // Font
  fontSize?: string;
  fontWeight?: string;
  // Border
  borderRadius?: string;
  borderWidth?: string;
  // Heights
  heightSm?: string;
  heightMd?: string;
  heightLg?: string;
  // Colors (primary variant)
  primaryBg?: string;
  primaryBgHover?: string;
  primaryBgActive?: string;
  primaryText?: string;
  // Colors (secondary variant)
  secondaryBg?: string;
  secondaryBgHover?: string;
  secondaryBgActive?: string;
  secondaryText?: string;
  secondaryBorder?: string;
}

/**
 * Input component tokens
 */
export interface InputTokens {
  // Padding
  paddingSm?: string;
  paddingMd?: string;
  paddingLg?: string;
  // Font
  fontSize?: string;
  // Border
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderColorHover?: string;
  borderColorFocus?: string;
  // Heights
  heightSm?: string;
  heightMd?: string;
  heightLg?: string;
  // Colors
  bg?: string;
  bgDisabled?: string;
  text?: string;
  textDisabled?: string;
  placeholder?: string;
  // Focus
  focusRing?: string;
}

/**
 * Badge component tokens
 */
export interface BadgeTokens {
  // Padding
  paddingX?: string;
  paddingY?: string;
  // Font
  fontSize?: string;
  fontWeight?: string;
  // Border
  borderRadius?: string;
  // Size
  minHeight?: string;
}

/**
 * Dialog component tokens
 */
export interface DialogTokens {
  // Padding
  padding?: string;
  headerPadding?: string;
  footerPadding?: string;
  // Border
  borderRadius?: string;
  // Colors
  bg?: string;
  overlayBg?: string;
  // Shadow
  shadow?: string;
  // Size
  maxWidth?: string;
}

/**
 * Tooltip component tokens
 */
export interface TooltipTokens {
  // Padding
  padding?: string;
  // Font
  fontSize?: string;
  // Border
  borderRadius?: string;
  // Colors
  bg?: string;
  text?: string;
  // Shadow
  shadow?: string;
  // Arrow
  arrowSize?: string;
}

/**
 * Menu component tokens
 */
export interface MenuTokens {
  bg?: string;
  border?: string;
  radius?: string;
  shadow?: string;
  itemPaddingY?: string;
  itemPaddingX?: string;
  itemHoverBg?: string;
  separatorColor?: string;
}

/**
 * Toast component tokens
 */
export interface ToastTokens {
  // Layout
  padding?: string;
  gap?: string;
  maxWidth?: string;
  // Border
  borderRadius?: string;
  borderWidth?: string;
  // Colors (base)
  bg?: string;
  text?: string;
  border?: string;
  // Colors (per status)
  infoBg?: string;
  infoBorder?: string;
  successBg?: string;
  successBorder?: string;
  warningBg?: string;
  warningBorder?: string;
  errorBg?: string;
  errorBorder?: string;
  // Shadow
  shadow?: string;
}

/**
 * DataTable component tokens
 */
export interface DataTableTokens {
  // Cell padding
  cellPadding?: string;
  // Border
  borderColor?: string;
  borderWidth?: string;
  // Header
  headerBg?: string;
  headerText?: string;
  headerFontWeight?: string;
  // Row
  rowBg?: string;
  rowBgHover?: string;
  rowBgSelected?: string;
  // Zebra striping
  rowBgAlt?: string;
}

/**
 * Default component token values
 */
export const defaultComponentTokens = {
  button: {
    paddingSm: 'var(--zp-space-2) var(--zp-space-3)',
    paddingMd: 'var(--zp-space-3) var(--zp-space-4)',
    paddingLg: 'var(--zp-space-4) var(--zp-space-6)',
    fontSize: 'var(--zp-font-size-md)',
    fontWeight: 'var(--zp-font-weight-semibold)',
    borderRadius: 'var(--zp-radius-md)',
    borderWidth: 'var(--zp-border-width-1)',
    heightSm: '2rem',
    heightMd: '2.5rem',
    heightLg: '3rem',
    primaryBg: 'var(--zp-color-brand)',
    primaryBgHover: 'var(--zp-color-brand-hover)',
    primaryBgActive: 'var(--zp-color-brand-active)',
    primaryText: 'var(--zp-color-text-inverse)',
    secondaryBg: 'transparent',
    secondaryBgHover: 'var(--zp-color-surface)',
    secondaryBgActive: 'var(--zp-color-surface-raised)',
    secondaryText: 'var(--zp-color-text-primary)',
    secondaryBorder: 'var(--zp-color-border)',
  } satisfies ButtonTokens,

  input: {
    paddingSm: 'var(--zp-space-2) var(--zp-space-3)',
    paddingMd: 'var(--zp-space-2) var(--zp-space-3)',
    paddingLg: 'var(--zp-space-3) var(--zp-space-4)',
    fontSize: 'var(--zp-font-size-md)',
    borderRadius: 'var(--zp-radius-md)',
    borderWidth: 'var(--zp-border-width-1)',
    borderColor: 'var(--zp-color-border)',
    borderColorHover: 'var(--zp-color-border-strong)',
    borderColorFocus: 'var(--zp-color-brand)',
    heightSm: '2rem',
    heightMd: '2.5rem',
    heightLg: '3rem',
    bg: 'var(--zp-color-background)',
    bgDisabled: 'var(--zp-color-surface)',
    text: 'var(--zp-color-text-primary)',
    textDisabled: 'var(--zp-color-text-disabled)',
    placeholder: 'var(--zp-color-text-secondary)',
    focusRing: 'var(--zp-color-focus-ring)',
  } satisfies InputTokens,

  badge: {
    paddingX: 'var(--zp-space-2)',
    paddingY: 'var(--zp-space-1)',
    fontSize: 'var(--zp-font-size-xs)',
    fontWeight: 'var(--zp-font-weight-medium)',
    borderRadius: 'var(--zp-radius-full)',
    minHeight: '1.25rem',
  } satisfies BadgeTokens,

  dialog: {
    padding: 'var(--zp-space-6)',
    headerPadding: 'var(--zp-space-5) var(--zp-space-6) var(--zp-space-3)',
    footerPadding: 'var(--zp-space-3) var(--zp-space-6) var(--zp-space-5)',
    borderRadius: 'var(--zp-radius-lg)',
    bg: 'var(--zp-color-surface)',
    overlayBg: 'var(--zp-overlay)',
    shadow: 'var(--zp-shadow-xl)',
    maxWidth: '32rem',
  } satisfies DialogTokens,

  tooltip: {
    padding: 'var(--zp-space-2) var(--zp-space-3)',
    fontSize: 'var(--zp-font-size-sm)',
    borderRadius: 'var(--zp-radius-md)',
    bg: 'var(--zp-color-neutral-900)',
    text: 'var(--zp-color-neutral-50)',
    shadow: 'var(--zp-shadow-md)',
    arrowSize: '6px',
  } satisfies TooltipTokens,

  dataTable: {
    cellPadding: 'var(--zp-space-3) var(--zp-space-4)',
    borderColor: 'var(--zp-color-border)',
    borderWidth: 'var(--zp-border-width-1)',
    headerBg: 'var(--zp-color-surface)',
    headerText: 'var(--zp-color-text-primary)',
    headerFontWeight: 'var(--zp-font-weight-semibold)',
    rowBg: 'var(--zp-color-background)',
    rowBgHover: 'var(--zp-color-surface)',
    rowBgSelected: 'var(--zp-color-brand-subtle)',
    rowBgAlt: 'var(--zp-color-surface)',
  } satisfies DataTableTokens,

  menu: {
    bg: 'var(--zp-color-surface)',
    border: 'var(--zp-color-border)',
    radius: 'var(--zp-radius-md)',
    shadow: 'var(--zp-shadow-lg)',
    itemPaddingY: 'var(--zp-space-2)',
    itemPaddingX: 'var(--zp-space-3)',
    itemHoverBg: 'var(--zp-color-surface-raised)',
    separatorColor: 'var(--zp-color-border-subtle)',
  } satisfies MenuTokens,

  toast: {
    padding: 'var(--zp-space-3) var(--zp-space-4)',
    gap: 'var(--zp-space-2)',
    maxWidth: '380px',
    borderRadius: 'var(--zp-radius-lg)',
    borderWidth: 'var(--zp-border-width-1)',
    bg: 'var(--zp-color-surface)',
    text: 'var(--zp-color-text-primary)',
    border: 'var(--zp-color-border-subtle)',
    shadow: 'var(--zp-shadow-lg)',
  } satisfies ToastTokens,

  skeleton: {
    baseColor: 'var(--zp-color-border-subtle)',
    highlightColor: 'var(--zp-color-surface)',
    shimmerDuration: 'var(--zp-duration-shimmer)',
    radius: 'var(--zp-radius-sm)',
  } satisfies SkeletonTokens,

  progress: {
    trackBg: 'var(--zp-color-border-subtle)',
    fillBg: 'var(--zp-color-brand)',
    heightSm: '4px',
    heightMd: '8px',
    heightLg: '12px',
    radius: 'var(--zp-radius-full)',
  } satisfies ProgressTokens,
};

/**
 * Skeleton component tokens
 */
export interface SkeletonTokens {
  baseColor?: string;
  highlightColor?: string;
  shimmerDuration?: string;
  radius?: string;
}

/**
 * Progress component tokens (shared by ProgressBar and CircularProgress)
 */
export interface ProgressTokens {
  trackBg?: string;
  fillBg?: string;
  heightSm?: string;
  heightMd?: string;
  heightLg?: string;
  radius?: string;
}

/**
 * All component token types
 */
export interface ComponentTokensMap {
  button?: Partial<ButtonTokens>;
  input?: Partial<InputTokens>;
  badge?: Partial<BadgeTokens>;
  dialog?: Partial<DialogTokens>;
  tooltip?: Partial<TooltipTokens>;
  dataTable?: Partial<DataTableTokens>;
  menu?: Partial<MenuTokens>;
  toast?: Partial<ToastTokens>;
  skeleton?: Partial<SkeletonTokens>;
  progress?: Partial<ProgressTokens>;
}

export type ComponentName = keyof ComponentTokensMap;
