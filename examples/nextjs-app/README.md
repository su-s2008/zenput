# Zenput – Next.js App Router Smoke-test Fixture

This minimal Next.js 15 (App Router) project verifies that zenput components
can be consumed from a Next.js App Router application without errors. It is
used as a CI smoke test to catch regressions in `'use client'` directives or
sub-path exports.

## What it tests

| Scenario | File |
|---|---|
| `zenput/server` import in Server Component | `app/layout.tsx`, `app/page.tsx` |
| `zenput/tokens` import in Server Component | `app/page.tsx` |
| Client components with hooks (`ThemeProvider`, `TextInput`, …) | `components/ZenputClientDemo.tsx` |

## Running locally

```bash
# From the repo root, build zenput first:
npm run build

# Then install and build this fixture (uses a file: dependency resolved via workspaces):
cd examples/nextjs-app
npm install
npm run build
```

## CI

The `nextjs-smoke` job in `.github/workflows/ci.yml` runs `next build` on every
push and pull-request. A build failure means a `'use client'` directive is
missing from the zenput bundle or an export is broken.
