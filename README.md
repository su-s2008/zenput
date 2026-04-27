# Zenput

[![CI](https://github.com/konarsubhojit/zenput/actions/workflows/ci.yml/badge.svg)](https://github.com/konarsubhojit/zenput/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/konarsubhojit/zenput/branch/master/graph/badge.svg)](https://codecov.io/gh/konarsubhojit/zenput)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=zenput&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=zenput)
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

Available modes: `'light'` (default), `'dark'`, `'highContrast'`, `'system'`

#### System Mode (OS Preference)

Use `mode="system"` to automatically follow the OS `prefers-color-scheme` preference. The resolved mode updates live when the user changes their OS setting:

```tsx
<ThemeProvider theme={{ mode: 'system' }}>
  {/* Automatically light or dark based on OS preference */}
</ThemeProvider>
```

#### Persistence with `storageKey`

Pass `storageKey` to persist the user's mode choice across page loads. The stored value takes precedence over the `theme.mode` prop on subsequent visits:

```tsx
<ThemeProvider theme={{ mode: 'system' }} storageKey="zp-theme">
  {/* User's last chosen mode is remembered */}
</ThemeProvider>
```

Use `storage="sessionStorage"` to scope persistence to the current browser session:

```tsx
<ThemeProvider theme={{ mode: 'light' }} storageKey="zp-theme" storage="sessionStorage">
  {/* ... */}
</ThemeProvider>
```

#### `useColorMode()` Hook

Read and control the color mode from any descendant component:

```tsx
import { useColorMode } from 'zenput';

function ThemeToggle() {
  const { mode, resolvedMode, setMode, toggle } = useColorMode();

  return (
    <button onClick={toggle}>
      Current: {resolvedMode} (selected: {mode})
    </button>
  );
}
```

| Property | Type | Description |
|----------|------|-------------|
| `mode` | `ColorMode` | User-selected mode (may be `'system'`). |
| `resolvedMode` | `ThemeMode` | Actual applied mode (`'light' \| 'dark' \| 'highContrast'`). |
| `setMode(mode)` | `(mode: ColorMode) => void` | Change the mode (persists if `storageKey` is set). |
| `toggle()` | `() => void` | Toggle between `'light'` and `'dark'`. |

#### High-Contrast Auto-Detection

When `detectHighContrast` is enabled alongside `mode="system"`, the provider automatically switches to `'highContrast'` when the OS `prefers-contrast: more` media feature is active:

```tsx
<ThemeProvider theme={{ mode: 'system' }} detectHighContrast>
  {/* ... */}
</ThemeProvider>
```

#### Anti-Flash Script (Next.js App Router)

Prevent a flash of the wrong colour scheme during server-side rendering by injecting an inline script into `<head>` before React hydrates. Use `getColorModeScript` to generate the script string:

```tsx
// app/layout.tsx
import Script from 'next/script';
import { ThemeProvider, getColorModeScript } from 'zenput';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          id="zp-color-mode"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: getColorModeScript({ storageKey: 'zp-theme', defaultMode: 'system' }),
          }}
        />
      </head>
      <body>
        {/* storageKey must match the script's storageKey */}
        <ThemeProvider theme={{ mode: 'system' }} storageKey="zp-theme" as="main">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

The script sets `data-zp-theme` on `<html>` before the first paint so your CSS variables are already correct when the page renders. This eliminates the flash even when the user prefers dark mode or has a stored preference.

#### `useReducedMotion()` Hook

Detect the OS `prefers-reduced-motion: reduce` preference and disable animations accordingly. All built-in Zenput animations already honour this media feature via the `--zp-duration-*` CSS custom properties:

```tsx
import { useReducedMotion } from 'zenput';

function AnimatedCard() {
  const reduced = useReducedMotion();
  return (
    <div
      style={{
        transition: reduced ? 'none' : 'transform var(--zp-duration-normal) var(--zp-easing-standard)',
      }}
    >
      {/* ... */}
    </div>
  );
}
```

#### Nested `ThemeProvider`

Nest `ThemeProvider` to apply a different theme to a specific section of your UI. The inner provider inherits the parent's resolved mode by default and merges CSS tokens — the child's values override the parent's:

```tsx
<ThemeProvider theme={{ mode: 'dark' }}>
  {/* Dark mode throughout */}
  <main>
    <ThemeProvider
      theme={{
        components: {
          button: { borderRadius: '9999px' },
        },
      }}
    >
      {/* Still dark mode, but with pill-shaped buttons in this section */}
    </ThemeProvider>
  </main>
</ThemeProvider>
```

Custom CSS variables from parent providers are inherited and can be overridden:

```tsx
<ThemeProvider theme={{ cssVars: { '--brand-accent': '#6366f1' } }}>
  <ThemeProvider theme={{ cssVars: { '--brand-accent': '#8b5cf6' } }}>
    {/* --brand-accent is '#8b5cf6' here */}
  </ThemeProvider>
</ThemeProvider>
```

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

## Imperative overlays

Zenput ships **provider-based imperative APIs** for Dialog, Drawer, and Popover. These are designed for "fire-and-forget" use cases where managing `open` state and JSX placement would be inconvenient — confirming navigation, prompting for input from a row-action callback, or surfacing errors from `fetch().catch()`.

> **Anti-pattern guard** — providers are for *transient* / *imperative* flows. The declarative
> `<Dialog open={x}>…</Dialog>` API remains the recommended primitive for dialogs whose content
> is part of the page layout. Both APIs ship side-by-side.

### Setup

Wrap your application (or a subtree) with the providers once:

```tsx
import { DialogProvider, DrawerProvider, PopoverProvider } from 'zenput';

<DialogProvider>
  <DrawerProvider>
    <PopoverProvider>
      <App />
    </PopoverProvider>
  </DrawerProvider>
</DialogProvider>
```

### `useConfirm`

```tsx
import { useConfirm } from 'zenput';

function DeleteButton() {
  const confirm = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete project?',
      description: 'This cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      destructive: true,   // uses the danger button variant
      dismissible: true,   // Escape / backdrop resolves false (default)
    });
    if (ok) deleteProject();
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

### `usePrompt`

```tsx
import { usePrompt } from 'zenput';

function RenameButton({ file, renameFile }: Props) {
  const prompt = usePrompt();

  const handleRename = async () => {
    const newName = await prompt({
      title: 'Rename file',
      label: 'New name',
      defaultValue: file.name,
      validate: (v) => v.trim().length > 0 || 'Name is required',
    });
    if (newName) renameFile(newName);
  };

  return <button onClick={handleRename}>Rename</button>;
}
```

### `useAlert`

```tsx
import { useAlert } from 'zenput';

function SaveButton() {
  const alert = useAlert();

  // Works great inside async error handlers — no JSX needed at the call site.
  const handleSave = async () => {
    try {
      await fetch('/api/save');
    } catch (err) {
      await alert({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### `useDialog` — generic content

```tsx
import { useDialog } from 'zenput';

function MyButton() {
  const dialog = useDialog();

  const openForm = async () => {
    const handle = dialog.open<string>({
      size: 'md',
      content: ({ close }) => (
        <MyForm onSubmit={(v) => close(v)} onCancel={() => close()} />
      ),
    });
    const result = await handle.result; // string | null
    return result;
  };

  return <button onClick={openForm}>Open form</button>;
}
```

### `useDrawer`

Same shape as `useDialog` but anchored to an edge of the viewport.

```tsx
import { useDrawer, DrawerHeader, DrawerTitle, DrawerBody, DrawerFooter } from 'zenput';

function OpenDetailsButton() {
  const drawer = useDrawer();

  const handleOpen = () => {
    drawer.open({
      side: 'right',   // 'left' | 'right' | 'top' | 'bottom'
      size: 'md',
      content: ({ close }) => (
        <>
          <DrawerHeader><DrawerTitle>Details</DrawerTitle></DrawerHeader>
          <DrawerBody>…</DrawerBody>
          <DrawerFooter><button onClick={() => close()}>Done</button></DrawerFooter>
        </>
      ),
    });
  };

  return <button onClick={handleOpen}>Open details</button>;
}
```

### `usePopover`

Anchor a popover to an element ref **or** `(x, y)` viewport coordinates.

```tsx
import { useRef } from 'react';
import { usePopover } from 'zenput';

function PopoverDemo() {
  const popover = usePopover();
  const ref = useRef<HTMLButtonElement>(null);

  // Anchored to an element
  const openMenu = () => {
    popover.open({
      anchor: ref,
      side: 'bottom',
      content: ({ close }) => <Menu onSelect={(v) => close(v)} />,
    });
  };

  // Anchored to cursor (context menu)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    popover.open({
      anchor: { x: e.clientX, y: e.clientY },
      content: ({ close }) => <Menu onSelect={(v) => close(v)} />,
    });
  };

  return (
    <button ref={ref} onClick={openMenu} onContextMenu={handleContextMenu}>
      Menu
    </button>
  );
}
```

### Promise resolution

| Hook | Resolved value | Dismissed value |
|------|---------------|-----------------|
| `useConfirm` | `true` | `false` |
| `usePrompt` | `string` | `null` |
| `useAlert` | `void` | `void` |
| `useDialog` | value passed to `close(value)` | `null` |
| `useDrawer` | value passed to `close(value)` | `null` |
| `usePopover` | value passed to `close(value)` | `null` |

All promises resolve (never reject). When the provider unmounts with open dialogs, remaining promises are resolved with their dismissed value — no unhandled rejection warnings.

### Stack support

Opening a dialog (or confirm) from inside another dialog stacks them in DOM order — the most recently opened overlay is on top. Escape and backdrop dismissal target only the topmost overlay; if the topmost is `dismissible: false`, neither it nor any underlying overlay can be dismissed via Escape/backdrop until it is closed programmatically.

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

## Forms

Zenput ships an **opt-in** form integration via the `zenput/forms` subpath. It wraps `react-hook-form` + `zod` so that every Zenput input gets `value`, `onChange`, `onBlur`, `name`, `ref`, `validationState`, `errorMessage`, `aria-invalid`, and `aria-describedby` wired up automatically.

### Installation

Install the peer dependencies alongside Zenput:

```bash
npm install zenput react-hook-form @hookform/resolvers zod
```

`react-hook-form`, `@hookform/resolvers`, and `zod` are **peer-optional** — the core bundle is unaffected if you don't use the `zenput/forms` entry point.

### End-to-end example

```tsx
import { z } from 'zod';
import { Form, useZenputForm } from 'zenput/forms';
import { TextInput, PasswordInput, Button } from 'zenput';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const form = useZenputForm<LoginValues>({
    schema: loginSchema,
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    await fetch('/api/login', { method: 'POST', body: JSON.stringify(values) });
  };

  return (
    <Form form={form} onSubmit={onSubmit}>
      {/* Error summary — focuses and lists all errors for screen readers */}
      <Form.ErrorSummary />

      <Form.Field<LoginValues> name="email">
        {(field) => (
          <TextInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            validationState={field.props.validationState}
            errorMessage={field.props.errorMessage}
            value={field.props.value as string}
            onChange={(e) => field.props.onChange(e.target.value)}
            onBlur={field.props.onBlur}
            ref={field.props.ref as React.Ref<HTMLInputElement>}
            name={field.props.name}
            fullWidth
          />
        )}
      </Form.Field>

      <Form.Field<LoginValues> name="password">
        {(field) => (
          <PasswordInput
            label="Password"
            validationState={field.props.validationState}
            errorMessage={field.props.errorMessage}
            value={field.props.value as string}
            onChange={(e) => field.props.onChange(e.target.value)}
            onBlur={field.props.onBlur}
            ref={field.props.ref as React.Ref<HTMLInputElement>}
            name={field.props.name}
            fullWidth
          />
        )}
      </Form.Field>

      <Button type="submit" loading={form.formState.isSubmitting} fullWidth>
        Sign in
      </Button>
    </Form>
  );
}
```

### API

#### `useZenputForm(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `schema` | `ZodType` | — | Zod schema for validation (optional). |
| `defaultValues` | `Partial<TFieldValues>` | — | Initial form values. |
| `mode` | `'onBlur' \| 'onChange' \| 'onSubmit' \| 'onTouched' \| 'all'` | `'onBlur'` | Validation trigger mode. |

Returns the standard `react-hook-form` `UseFormReturn` object — every RHF API is available.

#### `<Form form={form} onSubmit={handler}>`

| Prop | Type | Description |
|---|---|---|
| `form` | `UseFormReturn` | The form instance from `useZenputForm`. |
| `onSubmit` | `SubmitHandler` | Called with validated values on success. |
| `onError` | `SubmitErrorHandler` | Called with validation errors on failure (optional). |

#### `<Form.Field name="fieldName">`

Render-prop component. The child function receives `{ props, invalid, errorMessage }`. Spread `field.props` onto any Zenput input:

```tsx
<Form.Field name="email">
  {(field) => <TextInput {...field.props} label="Email" />}
</Form.Field>
```

#### `<Form.Submit>` / `<Form.Reset>`

Pre-wired `<button type="submit">` and `<button type="button">` (Reset wires to RHF's `reset()` to ensure controlled fields are cleared). Both are automatically disabled while the form is submitting.

#### `<Form.ErrorSummary>`

Renders a live region listing all current field errors. When errors first appear (e.g., after a failed submit), the container is focused automatically — critical for keyboard and screen-reader users.

### Recipe: no form library (`useFormField` only)

If you don't want `react-hook-form`, use `useFormField` directly:

```tsx
import { useFormField } from 'zenput';
import { TextInput } from 'zenput';
import { useState } from 'react';

function EmailField() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const { inputId, inputAriaProps } = useFormField({
    id: 'email',
    label: 'Email',
    errorMessage: error,
    validationState: error ? 'error' : 'default',
    required: true,
  });

  return (
    <TextInput
      id={inputId}
      label="Email"
      value={value}
      onChange={(e) => { setValue(e.target.value); setError(''); }}
      validationState={error ? 'error' : 'default'}
      errorMessage={error}
      required
      {...inputAriaProps}
    />
  );
}
```


## License

MIT © konarsubhojit
