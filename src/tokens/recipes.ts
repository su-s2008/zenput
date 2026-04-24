/**
 * Recipe system for common UI patterns and component variants.
 * Recipes are reusable style configurations that can be applied
 * across multiple components.
 */

export interface Recipe {
  /** Base styles that apply to all variants */
  base?: Record<string, string>;
  /** Variant-specific styles */
  variants?: Record<string, Record<string, string>>;
}

/**
 * Card recipe for container components
 */
export const cardRecipe: Recipe = {
  base: {
    backgroundColor: 'var(--zp-color-surface)',
    border: 'var(--zp-border-width-1) solid var(--zp-color-border)',
    borderRadius: 'var(--zp-radius-lg)',
    padding: 'var(--zp-space-4)',
  },
  variants: {
    elevated: {
      boxShadow: 'var(--zp-shadow-md)',
      border: 'none',
    },
    outlined: {
      boxShadow: 'none',
      border: 'var(--zp-border-width-1) solid var(--zp-color-border)',
    },
    flat: {
      boxShadow: 'none',
      border: 'none',
      backgroundColor: 'transparent',
    },
  },
};

/**
 * Interactive element recipe (buttons, links, etc.)
 */
export const interactiveRecipe: Recipe = {
  base: {
    cursor: 'pointer',
    transition: 'all var(--zp-duration-fast) var(--zp-easing-standard)',
    userSelect: 'none',
  },
  variants: {
    default: {
      opacity: '1',
    },
    hover: {
      transform: 'translateY(-1px)',
    },
    active: {
      transform: 'translateY(0)',
    },
    disabled: {
      cursor: 'not-allowed',
      opacity: '0.5',
    },
  },
};

/**
 * Focus ring recipe for accessible focus indicators
 */
export const focusRingRecipe: Recipe = {
  base: {
    outline: '2px solid var(--zp-color-focus-ring)',
    outlineOffset: '2px',
  },
  variants: {
    default: {
      outline: '2px solid var(--zp-color-focus-ring)',
      outlineOffset: '2px',
    },
    inset: {
      outline: '2px solid var(--zp-color-focus-ring)',
      outlineOffset: '-2px',
    },
    none: {
      outline: 'none',
    },
  },
};

/**
 * Input field recipe for form controls
 */
export const inputRecipe: Recipe = {
  base: {
    backgroundColor: 'var(--zp-color-background)',
    border: 'var(--zp-border-width-1) solid var(--zp-color-border)',
    borderRadius: 'var(--zp-radius-md)',
    color: 'var(--zp-color-text-primary)',
    fontFamily: 'var(--zp-font-family-sans)',
    fontSize: 'var(--zp-font-size-md)',
    padding: 'var(--zp-space-2) var(--zp-space-3)',
    transition: 'border-color var(--zp-duration-fast) var(--zp-easing-standard)',
  },
  variants: {
    default: {
      borderColor: 'var(--zp-color-border)',
    },
    hover: {
      borderColor: 'var(--zp-color-border-strong)',
    },
    focus: {
      borderColor: 'var(--zp-color-brand)',
      outline: '2px solid var(--zp-color-focus-ring)',
      outlineOffset: '2px',
    },
    error: {
      borderColor: 'var(--zp-color-danger)',
    },
    success: {
      borderColor: 'var(--zp-color-success)',
    },
    disabled: {
      backgroundColor: 'var(--zp-color-surface)',
      cursor: 'not-allowed',
      opacity: '0.6',
    },
  },
};

/**
 * Text recipe for typography variants
 */
export const textRecipe: Recipe = {
  base: {
    color: 'var(--zp-color-text-primary)',
    fontFamily: 'var(--zp-font-family-sans)',
  },
  variants: {
    primary: {
      color: 'var(--zp-color-text-primary)',
    },
    secondary: {
      color: 'var(--zp-color-text-secondary)',
    },
    disabled: {
      color: 'var(--zp-color-text-disabled)',
    },
    inverse: {
      color: 'var(--zp-color-text-inverse)',
    },
  },
};

/**
 * All available recipes
 */
export const recipes = {
  card: cardRecipe,
  interactive: interactiveRecipe,
  focusRing: focusRingRecipe,
  input: inputRecipe,
  text: textRecipe,
} as const;

export type RecipeName = keyof typeof recipes;
