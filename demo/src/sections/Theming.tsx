import { useState } from 'react';
import { ThemeProvider, extendTheme } from 'zenput';
import type { Theme } from 'zenput';
import { Section, Scenario } from './_shell';

// ---------------------------------------------------------------------------
// Density demo
// ---------------------------------------------------------------------------

function DensityDemo() {
  const [density, setDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');

  return (
    <div>
      <div className="row" style={{ marginBottom: '12px' }}>
        {(['compact', 'normal', 'spacious'] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDensity(d)}
            style={{
              fontWeight: density === d ? 700 : undefined,
              textDecoration: density === d ? 'underline' : undefined,
              textTransform: 'capitalize',
            }}
          >
            {d}
          </button>
        ))}
      </div>
      <ThemeProvider theme={{ density }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            border: '1px solid var(--zp-color-border-default)',
            borderRadius: 'var(--zp-radius-md)',
            background: 'var(--zp-color-surface-default)',
          }}
        >
          <p style={{ margin: 0 }}>
            Current density: <strong>{density}</strong>. Nested ThemeProvider inherits parent
            tokens and only overrides density.
          </p>
          <div className="row">
            <button type="button">Button</button>
            <input
              type="text"
              placeholder="Input"
              style={{
                padding: '6px 10px',
                border: '1px solid var(--zp-color-border-default)',
                borderRadius: 'var(--zp-radius-md)',
                background: 'var(--zp-color-surface-input)',
                color: 'var(--zp-color-text-default)',
              }}
            />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-component token override demo
// ---------------------------------------------------------------------------

const brandTheme: Theme = {
  primaryColor: '#6366f1',
  focusRingColor: '#6366f1',
  components: {
    button: {
      borderRadius: 'var(--zp-radius-full)',
    },
  },
};

function ComponentTokensDemo() {
  return (
    <ThemeProvider theme={brandTheme}>
      <div
        style={{
          padding: '16px',
          border: '1px solid var(--zp-color-border-default)',
          borderRadius: 'var(--zp-radius-md)',
          background: 'var(--zp-color-surface-default)',
        }}
      >
        <p style={{ margin: '0 0 12px' }}>
          <code>theme.components.button.borderRadius = 'var(--zp-radius-full)'</code>
          {' '}— pill-shaped buttons via per-component tokens.
        </p>
        <div className="row">
          <button type="button">Primary</button>
          <button type="button">Secondary</button>
        </div>
      </div>
    </ThemeProvider>
  );
}

// ---------------------------------------------------------------------------
// extendTheme composition demo
// ---------------------------------------------------------------------------

const baseTheme: Theme = {
  primaryColor: '#10b981',
  focusRingColor: '#10b981',
};

const compactOverlay = { density: 'compact' as const };

const composedTheme = extendTheme(baseTheme, compactOverlay, {
  components: {
    button: {
      borderRadius: 'var(--zp-radius-sm)',
    },
  },
});

function ExtendThemeDemo() {
  return (
    <ThemeProvider theme={composedTheme}>
      <div
        style={{
          padding: '16px',
          border: '1px solid var(--zp-color-border-default)',
          borderRadius: 'var(--zp-radius-md)',
          background: 'var(--zp-color-surface-default)',
        }}
      >
        <p style={{ margin: '0 0 12px' }}>
          Theme composed with <code>extendTheme(baseTheme, compactOverlay, componentOverrides)</code>.
          Density: compact, brand: emerald, button radius: sm.
        </p>
        <div className="row">
          <button type="button">Composed</button>
          <button type="button">Theme</button>
        </div>
      </div>
    </ThemeProvider>
  );
}

// ---------------------------------------------------------------------------
// Dark mode demo (showing that ThemeProvider adapts to mode)
// ---------------------------------------------------------------------------

function DarkModeDemo() {
  return (
    <ThemeProvider theme={{ mode: 'dark' }}>
      <div
        style={{
          padding: '16px',
          border: '1px solid var(--zp-color-border-default)',
          borderRadius: 'var(--zp-radius-md)',
          background: 'var(--zp-color-surface-canvas)',
          color: 'var(--zp-color-text-default)',
        }}
      >
        <p style={{ margin: 0 }}>
          <code>mode="dark"</code> — this nested provider forces dark mode within its subtree,
          regardless of the outer theme.
        </p>
      </div>
    </ThemeProvider>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export function ThemingSection() {
  return (
    <Section
      id="theming"
      name="Theming"
      description="Density scaling, per-component token overrides via theme.components, and extendTheme() composition."
    >
      <Scenario title="Density toggle (compact / normal / spacious)">
        <DensityDemo />
      </Scenario>

      <Scenario title="Per-component tokens (theme.components)">
        <ComponentTokensDemo />
      </Scenario>

      <Scenario title="extendTheme() composition">
        <ExtendThemeDemo />
      </Scenario>

      <Scenario title="mode='dark' nested provider">
        <DarkModeDemo />
      </Scenario>
    </Section>
  );
}
