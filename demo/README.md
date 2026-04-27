# Zenput Component Gallery

A live demo website that showcases every component in the Zenput design system,
with multiple scenarios per component (sizes, variants, validation states,
icons, disabled states and edge cases).

The demo imports Zenput directly from the repository source (`../src`) via a
Vite alias, so it always renders the current in-repo version of the library —
no build step required.

## Requirements

- Node.js 20.19+ or 22.12+ (required by Vite 8)
- npm 9+

## Getting started

From this `demo/` folder:

```bash
npm install
npm run dev
```

The dev server starts at <http://localhost:5173>.

## Available scripts

| Script              | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR.                   |
| `npm run build`     | Type-check and produce a static production build.     |
| `npm run preview`   | Preview the production build locally.                 |
| `npm run type-check`| Run the TypeScript compiler in `--noEmit` mode.       |

## What's included

The gallery is organised into four areas:

- **Foundations** — Typography (Heading, Text, Link, Code, Kbd) and Layout
  primitives (Box, Stack, Divider).
- **Actions** — Button (all variants / sizes / icon and loading states),
  Badge (tones, variants, counts, dots).
- **Form inputs** — TextInput, TextArea, NumberInput, PasswordInput,
  SelectInput (single and multi), Checkbox, CheckboxGroup, RadioGroup, Toggle,
  DateInput, TimeInput, FileInput, RangeInput, ColorInput, SearchInput,
  PhoneInput, OTPInput, AutoComplete, MoneyInput.
- **Data display** — DataTable (sorting/filtering/pagination, selectable rows,
  expandable rows, loading skeleton, empty state).

A theme switcher in the header applies different Zenput `<ThemeProvider>`
presets (Default, Indigo, Emerald, Rose, Dark, High contrast) so you can
preview components under each palette.

## Project layout

```
demo/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts          # Aliases `zenput` → `../src`
└── src/
    ├── main.tsx            # React entry point
    ├── App.tsx             # All component sections
    └── styles.css          # Demo-shell styles (uses `--zp-*` tokens)
```
