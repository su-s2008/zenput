import { describe, it, expect } from 'vitest';
import { getColorModeScript } from '../context/getColorModeScript';

/**
 * Unit tests for getColorModeScript (exposed via zenput/server).
 *
 * The function generates an inline <script> string that reads the persisted
 * color mode from storage and sets data-zp-theme on <html>. These tests
 * verify the generated script behaves correctly across all supported options.
 */

/** Execute a generated script in a simulated browser-like environment. */
function runScript(
  script: string,
  overrides: {
    storageValue?: string | null;
    prefersDark?: boolean;
    prefersHighContrast?: boolean;
    storage?: 'localStorage' | 'sessionStorage';
  } = {}
): string {
  const { storageValue = null, prefersDark = false, prefersHighContrast = false } = overrides;
  const storageType = overrides.storage ?? 'localStorage';

  const mockStorage: Record<string, string> = {};
  // Store the value at a predictable key that matches the test's storageKey
  if (storageValue !== null) {
    mockStorage['__key__'] = storageValue;
  }

  let resolvedAttr = '';

  const mockWindow = {
    [storageType]: {
      getItem: (key: string) => mockStorage[key] ?? null,
    },
    matchMedia: (query: string) => ({
      matches:
        (query.includes('prefers-color-scheme: dark') && prefersDark) ||
        (query.includes('prefers-contrast: more') && prefersHighContrast),
    }),
  };

  const mockDocument = {
    documentElement: {
      setAttribute: (_attr: string, value: string) => {
        resolvedAttr = value;
      },
    },
  };

  // Use Function constructor to run the script in an isolated scope
  const fn = new Function('window', 'document', script);
  fn(mockWindow, mockDocument);

  return resolvedAttr;
}

describe('getColorModeScript', () => {
  describe('return value', () => {
    it('returns a non-empty string', () => {
      const s = getColorModeScript({ storageKey: 'theme' });
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    });

    it('starts with an IIFE', () => {
      const script = getColorModeScript({ storageKey: 'theme' });
      expect(script.trim()).toMatch(/^\(function\(\)/);
    });

    it('embeds storageKey as a JSON string literal', () => {
      const script = getColorModeScript({ storageKey: 'my-theme-key' });
      expect(script).toContain('"my-theme-key"');
    });
  });

  describe('no stored value, defaultMode="light" (default)', () => {
    it('resolves to light when no stored value regardless of OS preference', () => {
      const script = getColorModeScript({ storageKey: '__key__' });
      // Without mode='system', OS preference is not checked
      expect(runScript(script, { prefersDark: false })).toBe('light');
      expect(runScript(script, { prefersDark: true })).toBe('light');
    });

    it('resolves to dark when defaultMode="dark"', () => {
      const script = getColorModeScript({ storageKey: '__key__', defaultMode: 'dark' });
      expect(runScript(script)).toBe('dark');
    });
  });

  describe('no stored value, defaultMode="system"', () => {
    it('resolves to dark when OS prefers dark', () => {
      const script = getColorModeScript({ storageKey: '__key__', defaultMode: 'system' });
      expect(runScript(script, { prefersDark: true })).toBe('dark');
    });

    it('resolves to light when OS does not prefer dark', () => {
      const script = getColorModeScript({ storageKey: '__key__', defaultMode: 'system' });
      expect(runScript(script, { prefersDark: false })).toBe('light');
    });
  });

  describe('stored value', () => {
    it('uses stored light value', () => {
      const script = getColorModeScript({ storageKey: '__key__' });
      expect(runScript(script, { storageValue: 'light' })).toBe('light');
    });

    it('uses stored dark value', () => {
      const script = getColorModeScript({ storageKey: '__key__' });
      expect(runScript(script, { storageValue: 'dark', prefersDark: false })).toBe('dark');
    });

    it('uses stored highContrast value', () => {
      const script = getColorModeScript({ storageKey: '__key__' });
      expect(runScript(script, { storageValue: 'highContrast' })).toBe('highContrast');
    });

    it('ignores invalid stored values and falls back to defaultMode', () => {
      const script = getColorModeScript({ storageKey: '__key__', defaultMode: 'light' });
      // Invalid stored value → falls back to defaultMode
      expect(runScript(script, { storageValue: 'invalid-mode' })).toBe('light');
    });

    it('resolves stored system to dark when OS is dark', () => {
      const script = getColorModeScript({ storageKey: '__key__' });
      expect(runScript(script, { storageValue: 'system', prefersDark: true })).toBe('dark');
    });

    it('resolves stored system to light when OS is light', () => {
      const script = getColorModeScript({ storageKey: '__key__' });
      expect(runScript(script, { storageValue: 'system', prefersDark: false })).toBe('light');
    });
  });

  describe('detectHighContrast option', () => {
    it('resolves to highContrast when stored=system and OS prefers high contrast', () => {
      const script = getColorModeScript({
        storageKey: '__key__',
        detectHighContrast: true,
      });
      expect(
        runScript(script, { storageValue: 'system', prefersDark: false, prefersHighContrast: true })
      ).toBe('highContrast');
    });

    it('resolves to dark when stored=system, high contrast not active, OS is dark', () => {
      const script = getColorModeScript({
        storageKey: '__key__',
        detectHighContrast: true,
      });
      expect(
        runScript(script, { storageValue: 'system', prefersDark: true, prefersHighContrast: false })
      ).toBe('dark');
    });

    it('does not check prefers-contrast when detectHighContrast=false (default)', () => {
      const script = getColorModeScript({ storageKey: '__key__' });
      // Even with prefersHighContrast=true and stored=system, the script
      // should not return highContrast since detectHighContrast defaults to false
      expect(
        runScript(script, { storageValue: 'system', prefersDark: false, prefersHighContrast: true })
      ).toBe('light');
    });
  });

  describe('sessionStorage option', () => {
    it('reads from sessionStorage when storage="sessionStorage"', () => {
      const script = getColorModeScript({
        storageKey: '__key__',
        storage: 'sessionStorage',
      });
      expect(runScript(script, { storageValue: 'dark', storage: 'sessionStorage' })).toBe('dark');
    });
  });
});
