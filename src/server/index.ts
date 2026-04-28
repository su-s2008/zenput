/**
 * `zenput/server` — SSR-safe server-side helpers for Zenput.
 *
 * This module has **no client-side React imports** and is safe to import from
 * Next.js App Router Server Components, Remix loaders, or any other
 * server-side code without triggering "client-only" errors.
 *
 * Exports:
 *   - `getColorModeScript` — inline `<script>` string to inject into `<head>`
 *     before first paint. It reads the persisted color mode from storage and
 *     `prefers-color-scheme`, then writes `data-zp-theme` on `<html>` so the
 *     CSS variables rendered by `ThemeProvider` are already correct before the
 *     app hydrates — preventing a flash of wrong color scheme.
 *
 *     **Must be used together with `<ThemeProvider storageKey="…">`** — the
 *     `storageKey` passed to the script must match the one passed to the
 *     provider so both sides agree on which storage key to read/write.
 */

// Re-export from the context module. The `import type` in getColorModeScript.ts
// is erased at compile time so this bundle remains free of React imports.
export type { GetColorModeScriptOptions } from '../context/getColorModeScript';
export { getColorModeScript } from '../context/getColorModeScript';
