/**
 * Snapshot test for the full set of CSS custom properties emitted by
 * `buildCssVariables`.
 *
 * This test guards against accidental removals or renames of tokens.
 * If you intentionally add or rename a token, update the snapshot by
 * running `npx vitest run --update-snapshot`.
 */
import { describe, it, expect } from 'vitest';
import { buildCssVariables, toKebabCase, normalizeSpacingKey, cssVar } from './index';
import { lightSemantic, darkSemantic, highContrastSemantic } from './colors';

describe('toKebabCase', () => {
  it('converts camelCase to kebab-case', () => {
    expect(toKebabCase('surfaceRaised')).toBe('surface-raised');
    expect(toKebabCase('textPrimary')).toBe('text-primary');
  });

  it('handles letter→digit transitions', () => {
    expect(toKebabCase('surface0')).toBe('surface-0');
    expect(toKebabCase('surface4')).toBe('surface-4');
    expect(toKebabCase('heading1')).toBe('heading-1');
  });

  it('lowercases the result', () => {
    expect(toKebabCase('FontSize')).toBe('font-size');
  });

  it('leaves already-kebab-cased strings unchanged', () => {
    expect(toKebabCase('border-width')).toBe('border-width');
  });
});

describe('normalizeSpacingKey', () => {
  it('replaces dots with dashes', () => {
    expect(normalizeSpacingKey('0.5')).toBe('0-5');
    expect(normalizeSpacingKey('1.5')).toBe('1-5');
  });

  it('leaves integer keys unchanged', () => {
    expect(normalizeSpacingKey('4')).toBe('4');
  });
});

describe('cssVar', () => {
  it('returns a CSS var() reference', () => {
    expect(cssVar('color-brand')).toBe('var(--zp-color-brand)');
    expect(cssVar('space-4')).toBe('var(--zp-space-4)');
  });

  it('includes a fallback when provided', () => {
    expect(cssVar('color-brand', '#fff')).toBe('var(--zp-color-brand, #fff)');
  });

  it('normalizes dot-containing keys', () => {
    expect(cssVar('space-0.5')).toBe('var(--zp-space-0-5)');
  });
});

describe('buildCssVariables — CSS variable key snapshot', () => {
  it('emits the expected full set of keys in light mode', () => {
    const vars = buildCssVariables(lightSemantic);
    // Sort keys for a stable, diff-friendly snapshot.
    const sortedKeys = Object.keys(vars).sort();
    expect(sortedKeys).toMatchSnapshot();
  });

  it('emits the expected full set of keys in dark mode', () => {
    const vars = buildCssVariables(darkSemantic);
    const sortedKeys = Object.keys(vars).sort();
    expect(sortedKeys).toMatchSnapshot();
  });

  it('emits the expected full set of keys in highContrast mode', () => {
    const vars = buildCssVariables(highContrastSemantic);
    const sortedKeys = Object.keys(vars).sort();
    expect(sortedKeys).toMatchSnapshot();
  });

  it('contains the new focus-ring tokens', () => {
    const vars = buildCssVariables(lightSemantic);
    expect(vars['--zp-focus-ring-width']).toBe('2px');
    expect(vars['--zp-focus-ring-offset']).toBe('2px');
    expect(vars['--zp-focus-ring-style']).toBe('solid');
    expect(vars['--zp-focus-ring-color']).toBe('var(--zp-color-focus-ring)');
  });

  it('contains surface level tokens (0–4)', () => {
    const vars = buildCssVariables(lightSemantic);
    expect(vars['--zp-color-surface-0']).toBeDefined();
    expect(vars['--zp-color-surface-1']).toBeDefined();
    expect(vars['--zp-color-surface-2']).toBeDefined();
    expect(vars['--zp-color-surface-3']).toBeDefined();
    expect(vars['--zp-color-surface-4']).toBeDefined();
  });

  it('contains the new border tokens', () => {
    const vars = buildCssVariables(lightSemantic);
    expect(vars['--zp-color-border-inverse']).toBeDefined();
    expect(vars['--zp-color-border-focus']).toBeDefined();
  });

  it('contains the neutral semantic tokens', () => {
    const vars = buildCssVariables(lightSemantic);
    expect(vars['--zp-color-neutral']).toBeDefined();
    expect(vars['--zp-color-neutral-subtle']).toBeDefined();
    expect(vars['--zp-color-neutral-text']).toBeDefined();
    expect(vars['--zp-color-neutral-bg-subtle']).toBeDefined();
    expect(vars['--zp-color-neutral-bg-solid']).toBeDefined();
    expect(vars['--zp-color-neutral-text-on-solid']).toBeDefined();
  });

  it('contains semantic triplets for all states', () => {
    const vars = buildCssVariables(lightSemantic);
    for (const state of ['success', 'warning', 'danger', 'info', 'neutral']) {
      expect(vars[`--zp-color-${state}-bg-subtle`]).toBeDefined();
      expect(vars[`--zp-color-${state}-bg-solid`]).toBeDefined();
      expect(vars[`--zp-color-${state}-text-on-solid`]).toBeDefined();
    }
  });

  it('contains radius alias tokens (pill, card)', () => {
    const vars = buildCssVariables(lightSemantic);
    expect(vars['--zp-radius-pill']).toBe('9999px');
    expect(vars['--zp-radius-card']).toBe('8px');
  });

  it('contains z-index named slots for dialog and drawer', () => {
    const vars = buildCssVariables(lightSemantic);
    expect(vars['--zp-z-dialog']).toBeDefined();
    expect(vars['--zp-z-drawer']).toBeDefined();
    expect(vars['--zp-z-toast']).toBeDefined();
    expect(vars['--zp-z-popover']).toBeDefined();
    expect(vars['--zp-z-tooltip']).toBeDefined();
  });

  it('contains the bounce easing token', () => {
    const vars = buildCssVariables(lightSemantic);
    expect(vars['--zp-easing-bounce']).toBe('cubic-bezier(0.34, 1.56, 0.64, 1)');
  });

  it('does not remove any previously existing token', () => {
    const vars = buildCssVariables(lightSemantic);
    // Spot-check a representative sample of pre-existing tokens.
    const expected = [
      '--zp-color-brand',
      '--zp-color-success',
      '--zp-color-warning',
      '--zp-color-danger',
      '--zp-color-info',
      '--zp-color-background',
      '--zp-color-surface',
      '--zp-color-surface-raised',
      '--zp-color-text-primary',
      '--zp-color-text-secondary',
      '--zp-color-border',
      '--zp-color-border-strong',
      '--zp-color-border-subtle',
      '--zp-color-focus-ring',
      '--zp-space-4',
      '--zp-radius-md',
      '--zp-shadow-md',
      '--zp-duration-fast',
      '--zp-easing-standard',
      '--zp-z-modal',
      '--zp-z-toast',
      '--zp-z-tooltip',
    ];
    for (const key of expected) {
      expect(vars).toHaveProperty(key);
    }
  });
});
