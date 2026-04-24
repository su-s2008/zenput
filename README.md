# Zenput

[![CI](https://github.com/konarsubhojit/zenput/actions/workflows/ci.yml/badge.svg)](https://github.com/konarsubhojit/zenput/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/konarsubhojit/zenput/branch/master/graph/badge.svg)](https://codecov.io/gh/konarsubhojit/zenput)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=konarsubhojit_simple-app&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=konarsubhojit_simple-app)
[![npm](https://img.shields.io/npm/v/zenput.svg)](https://www.npmjs.com/package/zenput)
[![bundle size](https://img.shields.io/bundlephobia/minzip/zenput)](https://bundlephobia.com/package/zenput)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

A production-ready, accessible React TypeScript input components library with 18 fully-featured components.

## Features

- 🎯 **18 input components** — TextInput, TextArea, NumberInput, PasswordInput, SelectInput, Checkbox, CheckboxGroup, RadioGroup, Toggle, DateInput, TimeInput, FileInput, RangeInput, ColorInput, SearchInput, PhoneInput, OTPInput, AutoComplete
- ♿ **Fully accessible** — ARIA attributes, keyboard navigation, screen reader support
- 🎨 **Themeable** — CSS custom properties with `ThemeProvider`
- 📐 **3 sizes** — `sm`, `md`, `lg`
- 🖼️ **3 variants** — `outlined`, `filled`, `underlined`
- ✅ **Validation states** — `default`, `error`, `success`, `warning`
- 🔒 **TypeScript strict** — No `any` types, full type safety
- 📦 **Tree-shakeable** — ESM + CJS dual output
- 🧪 **Tested** — comprehensive test coverage with React Testing Library

## Installation

```bash
npm install zenput
```

## Quick Start

```tsx
import { TextInput, ThemeProvider } from 'zenput';

function App() {
  return (
    <ThemeProvider theme={{ primaryColor: '#6366f1' }}>
      <TextInput
        label="Email"
        placeholder="you@example.com"
        required
        fullWidth
      />
    </ThemeProvider>
  );
}
```

## Components

### TextInput
```tsx
<TextInput
  label="Username"
  placeholder="Enter username"
  size="md"
  variant="outlined"
  validationState="error"
  errorMessage="Username is required"
  required
  fullWidth
/>
```

### TextArea
```tsx
<TextArea
  label="Bio"
  placeholder="Tell us about yourself"
  autoResize
  showCharCount
  maxLength={500}
  rows={4}
/>
```

### NumberInput
```tsx
<NumberInput
  label="Quantity"
  min={0}
  max={100}
  step={1}
  defaultValue={1}
/>
```

### PasswordInput
```tsx
<PasswordInput
  label="Password"
  showStrengthIndicator
/>
```

### SelectInput
```tsx
<SelectInput
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
  placeholder="Select a country"
/>
```

### Checkbox
```tsx
<Checkbox label="I agree to the terms" required />
```

### CheckboxGroup
```tsx
<CheckboxGroup
  label="Interests"
  options={[
    { value: 'react', label: 'React' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'node', label: 'Node.js' },
  ]}
  value={['react']}
  onChange={(values) => console.log(values)}
/>
```

### RadioGroup
```tsx
<RadioGroup
  label="Plan"
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' },
  ]}
  value="free"
  onChange={(value) => console.log(value)}
/>
```

### Toggle
```tsx
<Toggle label="Enable notifications" defaultChecked />
```

### DateInput
```tsx
<DateInput label="Date of birth" min="1900-01-01" max="2024-12-31" />
```

### TimeInput
```tsx
<TimeInput label="Meeting time" />
```

### FileInput
```tsx
<FileInput label="Upload avatar" accept="image/*" />
```

### RangeInput
```tsx
<RangeInput label="Volume" min={0} max={100} defaultValue={50} showValue />
```

### ColorInput
```tsx
<ColorInput label="Brand color" defaultValue="#3b82f6" />
```

### SearchInput
```tsx
<SearchInput
  label="Search"
  placeholder="Search..."
  onSearch={(q) => console.log(q)}
/>
```

### PhoneInput
```tsx
<PhoneInput
  label="Phone number"
  defaultDialCode="+1"
/>
```

### OTPInput
```tsx
<OTPInput
  label="Verification code"
  length={6}
  onChange={(value) => console.log(value)}
/>
```

### AutoComplete
```tsx
<AutoComplete
  label="City"
  options={[
    { value: 'nyc', label: 'New York' },
    { value: 'la', label: 'Los Angeles' },
    { value: 'chi', label: 'Chicago' },
  ]}
  onSearch={(q) => console.log(q)}
/>
```

## Theming

Zenput provides a comprehensive theming system with semantic colors, per-component tokens, density scaling, and theme composition utilities.

### Basic Theming

Use `ThemeProvider` to customize design tokens:

```tsx
import { ThemeProvider } from 'zenput';

<ThemeProvider
  theme={{
    primaryColor: '#6366f1',
    errorColor: '#dc2626',
    successColor: '#16a34a',
    warningColor: '#d97706',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif',
  }}
>
  {/* your app */}
</ThemeProvider>
```

### Advanced Theming

#### Theme Modes

Switch between light, dark, and high-contrast modes:

```tsx
<ThemeProvider theme={{ mode: 'dark' }}>
  {/* your app */}
</ThemeProvider>
```

Available modes: `'light'` (default), `'dark'`, `'highContrast'`

#### Density Scaling

Control component sizing with density tokens:

```tsx
<ThemeProvider theme={{ density: 'compact' }}>
  {/* your app */}
</ThemeProvider>
```

Available densities: `'compact'`, `'normal'` (default), `'spacious'`

#### Semantic Color Overrides

Override semantic colors while preserving the mode's defaults:

```tsx
<ThemeProvider
  theme={{
    mode: 'light',
    semantic: {
      brand: '#6366f1',
      brandHover: '#4f46e5',
      danger: '#ef4444',
      success: '#10b981',
    },
  }}
>
  {/* your app */}
</ThemeProvider>
```

#### Per-Component Tokens

Customize individual component styles:

```tsx
<ThemeProvider
  theme={{
    components: {
      button: {
        borderRadius: '9999px',      // Pill-shaped buttons
        primaryBg: '#8b5cf6',
        primaryBgHover: '#7c3aed',
      },
      input: {
        borderRadius: 'var(--zp-radius-xl)',
        borderColor: '#8b5cf6',
      },
      badge: {
        fontSize: 'var(--zp-font-size-sm)',
        borderRadius: 'var(--zp-radius-sm)',
      },
    },
  }}
>
  {/* your app */}
</ThemeProvider>
```

Available component tokens: `button`, `input`, `badge`, `dialog`, `tooltip`, `dataTable`

#### Theme Composition with `extendTheme()`

Compose themes by extending a base theme:

```tsx
import { ThemeProvider, extendTheme } from 'zenput';

// Create a base brand theme
const brandTheme = {
  mode: 'light' as const,
  semantic: {
    brand: '#6366f1',
    brandHover: '#4f46e5',
  },
};

// Extend with additional customizations
const customTheme = extendTheme(brandTheme, {
  density: 'spacious',
  components: {
    button: {
      borderRadius: 'var(--zp-radius-lg)',
    },
  },
});

<ThemeProvider theme={customTheme}>
  {/* your app */}
</ThemeProvider>
```

#### Multiple Theme Extensions

Chain multiple theme presets:

```tsx
const baseTheme = { mode: 'light' as const };
const densityPreset = { density: 'compact' as const };
const componentOverrides = {
  components: {
    button: { borderRadius: 'var(--zp-radius-full)' },
  },
};

const finalTheme = extendTheme(baseTheme, densityPreset, componentOverrides);
```

#### Custom CSS Variables

Add arbitrary CSS custom properties:

```tsx
<ThemeProvider
  theme={{
    cssVars: {
      '--custom-accent': '#f59e0b',
      '--custom-highlight': '#fbbf24',
    },
  }}
>
  {/* your app */}
</ThemeProvider>
```

### Token Browser

Explore all available design tokens interactively:

`TokenBrowser` uses the `--zp-*` CSS variables emitted by `ThemeProvider`, so
render it inside a provider:

```tsx
import { ThemeProvider, TokenBrowser } from 'zenput';

<ThemeProvider>
  <TokenBrowser defaultCategory="colors" />
</ThemeProvider>
```

### Design Token Reference

#### Overlay / z-index / elevation tokens

The following CSS custom properties are emitted by `ThemeProvider` and available for advanced customisation:

#### Z-index scale (`--zp-z-*`)

| Custom property | Value | Usage |
|-----------------|-------|-------|
| `--zp-z-hide` | `-1` | Hidden layers |
| `--zp-z-base` | `0` | Default stacking |
| `--zp-z-raised` | `1` | Slightly raised elements |
| `--zp-z-docked` | `10` | Docked/fixed bars |
| `--zp-z-dropdown` | `1000` | Dropdown menus |
| `--zp-z-sticky` | `1100` | Sticky headers/footers |
| `--zp-z-banner` | `1200` | Banners/notifications |
| `--zp-z-overlay` | `1300` | Generic overlays |
| `--zp-z-modal` | `1400` | Modal dialogs |
| `--zp-z-popover` | `1500` | Popovers |
| `--zp-z-skip-nav` | `1600` | Skip-navigation links |
| `--zp-z-toast` | `1700` | Toast notifications |
| `--zp-z-tooltip` | `1800` | Tooltips |

#### Elevation scale (`--zp-elevation-*`)

| Custom property | Description |
|-----------------|-------------|
| `--zp-elevation-0` | No shadow |
| `--zp-elevation-1` | Extra-small shadow |
| `--zp-elevation-2` | Small shadow |
| `--zp-elevation-3` | Medium shadow |
| `--zp-elevation-4` | Large shadow |
| `--zp-elevation-5` | Extra-large shadow |

#### Overlay backdrop (`--zp-overlay`)

| Custom property | Light | Dark | High-contrast |
|-----------------|-------|------|---------------|
| `--zp-overlay` | `rgba(17, 24, 39, 0.5)` | `rgba(0, 0, 0, 0.6)` | `rgba(0, 0, 0, 0.75)` |

## Props

### Common props (all components inherit `BaseInputProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Visual size |
| `variant` | `'outlined' \| 'filled' \| 'underlined'` | `'outlined'` | Visual variant |
| `validationState` | `'default' \| 'error' \| 'success' \| 'warning'` | `'default'` | Validation state |
| `label` | `string` | — | Label text |
| `helperText` | `string` | — | Helper text below input |
| `errorMessage` | `string` | — | Error message (shown when `validationState='error'`) |
| `successMessage` | `string` | — | Success message |
| `warningMessage` | `string` | — | Warning message |
| `required` | `boolean` | `false` | Mark field as required |
| `disabled` | `boolean` | `false` | Disable the input |
| `readOnly` | `boolean` | `false` | Make the input read-only |
| `prefixIcon` | `React.ReactNode` | — | Icon/element before the input |
| `suffixIcon` | `React.ReactNode` | — | Icon/element after the input |
| `fullWidth` | `boolean` | `false` | Expand to full container width |
| `wrapperClassName` | `string` | — | Class for the wrapper element |
| `inputClassName` | `string` | — | Class for the input element |

## Development

```bash
# Install dependencies
npm install

# Run tests (Vitest)
npm test

# Watch tests / open Vitest UI
npm run test:watch
npm run test:ui

# Run tests with coverage (85% lines/statements/functions, 80% branches)
npm run test:coverage

# Build the library (Rollup → dist/)
npm run build

# Lint (ESLint 9 flat config + jsx-a11y)
npm run lint

# Type check
npm run type-check

# Bundle-size budget (size-limit)
npm run size
npm run size:why

# Storybook
npm run storybook         # dev server on :6006
npm run build-storybook   # static build → storybook-static/
npm run test:storybook    # Storybook a11y via @storybook/test-runner
```

## Running CI locally

Both GitHub Actions and the Azure Pipeline delegate to the same npm scripts,
so a local run that matches CI is:

```bash
npm ci
npm run lint
npm run type-check
npm run test:ci          # coverage + JUnit (reports/junit.xml)
npm run build
npm run build-storybook
npm run size
```

### Azure self-hosted prerequisites

The Azure Pipeline (`AzCICD.yml`) targets a single self-hosted Linux agent in
the pool `Default` and runs all CI steps sequentially on that one machine
(lint → type-check → test → build → size → Storybook a11y). The agent needs
`git`, Node 20.x (ideally managed via `nvm`), and npm 10+ pre-installed.
Playwright browsers are cached under `~/.cache/ms-playwright` and installed
only when missing. SonarCloud analysis is gated on a `SONAR_TOKEN` pipeline
variable and a service connection named `SonarCloud`.

## License

MIT © konarsubhojit
