#!/usr/bin/env node
/**
 * demo/scripts/check-coverage.mjs
 *
 * Parity check: every top-level component exported from `src/components/index.ts`
 * must appear in at least one of:
 *   - a section filename under `demo/src/sections/` (e.g. MyComponent.tsx)
 *   - a nav-entry `id` in `demo/src/App.tsx`
 *   - the COMPONENT_TO_SECTION_MAP (for components grouped into multi-component sections)
 *
 * Run with: node demo/scripts/check-coverage.mjs
 * Exit 1 when any component is missing coverage.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

// ---------------------------------------------------------------------------
// Components that are intentionally excluded from the parity check:
//   - Pure utility/a11y primitives with no visual demo
//   - Sub-module re-export folders (not user-facing components themselves)
// ---------------------------------------------------------------------------

const EXCLUDED_COMPONENTS = new Set([
  // Utility: screen-reader-only wrapper, no visual representation
  'VisuallyHidden',
  // Sub-module re-export path (providers live inside overlay sections)
  'providers',
]);

// ---------------------------------------------------------------------------
// Explicit component → section-id mapping for components that are grouped
// into a shared section rather than having their own dedicated section file.
// ---------------------------------------------------------------------------

const COMPONENT_TO_SECTION_MAP = {
  // layout section covers Box, Stack, Divider
  Box: 'layout',
  Stack: 'layout',
  Divider: 'layout',
  // date-time section covers DateInput, TimeInput
  DateInput: 'date-time',
  TimeInput: 'date-time',
  // pickers section covers Calendar, DatePicker, DateRangePicker, TimePicker
  Calendar: 'pickers',
  DatePicker: 'pickers',
  DateRangePicker: 'pickers',
  TimePicker: 'pickers',
  // actions-ext section covers Avatar, Tag, SegmentedControl
  Avatar: 'actions-ext',
  Tag: 'actions-ext',
  SegmentedControl: 'actions-ext',
  // feedback section covers Spinner, Skeleton, ProgressBar, CircularProgress
  Spinner: 'feedback',
  Skeleton: 'feedback',
  ProgressBar: 'feedback',
  CircularProgress: 'feedback',
  // content section covers Card, EmptyState, Pagination
  Card: 'content',
  EmptyState: 'content',
  Pagination: 'content',
  // menu section covers ContextMenu
  ContextMenu: 'menu',
};

// ---------------------------------------------------------------------------
// 1. Collect public component names from src/components/index.ts
// ---------------------------------------------------------------------------

const COMPONENTS_INDEX = resolve(ROOT, 'src/components/index.ts');
const indexSrc = readFileSync(COMPONENTS_INDEX, 'utf8');

/**
 * Extract the bare module path from each `export * from '...'` line.
 * Each path segment like './Tabs', './overlay', './feedback' etc. maps to
 * a folder whose name we treat as the component / group name.
 */
const exportLines = [...indexSrc.matchAll(/^export \* from ['"]\.\/([^'"]+)['"]/gm)];
const componentNames = new Set(
  exportLines
    .map(([, path]) => {
      // Take the first path segment as the component name
      // e.g. 'navigation' → 'navigation', 'Field' → 'Field'
      return path.split('/')[0];
    })
    // Filter out clearly internal / non-component paths
    .filter(
      (name) =>
        !name.startsWith('_') &&
        name !== 'index' &&
        // These are utility modules, not UI components
        !['utils', 'hooks', 'context', 'types', 'tokens', 'stories'].includes(name)
    )
);

// Flatten sub-index re-exports: if a path refers to a sub-folder (navigation,
// overlay, feedback, layout, actions), resolve its index.ts and collect the
// exported names from there as well, so individual component names appear.
const SUB_INDEX_DIRS = ['navigation', 'overlay', 'feedback', 'layout', 'actions'];

for (const dir of SUB_INDEX_DIRS) {
  const subIndexPath = resolve(ROOT, 'src/components', dir, 'index.ts');
  let subSrc;
  try {
    subSrc = readFileSync(subIndexPath, 'utf8');
  } catch {
    continue;
  }

  const subExports = [...subSrc.matchAll(/^export \* from ['"]\.\/([^'"]+)['"]/gm)];
  for (const [, subPath] of subExports) {
    const name = subPath.split('/')[0];
    if (!name.startsWith('_')) {
      componentNames.add(name);
    }
  }
  // Remove the parent group name (e.g. 'navigation') and replace with its
  // individual children collected above.
  componentNames.delete(dir);
}

// Also handle the 'providers' sub-module from overlay
// (it's re-exported as a sub-path, individual providers are covered by their section)
const overlayIndex = resolve(ROOT, 'src/components/overlay/index.ts');
try {
  const overlaySrc = readFileSync(overlayIndex, 'utf8');
  if (overlaySrc.includes("from './providers'")) {
    componentNames.add('providers');
  }
} catch {
  // ignore
}

// ---------------------------------------------------------------------------
// 2. Collect section filenames under demo/src/sections/
// ---------------------------------------------------------------------------

const SECTIONS_DIR = resolve(ROOT, 'demo/src/sections');
const sectionFiles = readdirSync(SECTIONS_DIR)
  .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
  .filter((f) => !f.startsWith('_'))
  .map((f) => basename(f, extname(f)).toLowerCase());

// ---------------------------------------------------------------------------
// 3. Collect nav-entry ids from demo/src/App.tsx
// ---------------------------------------------------------------------------

const APP_TSX = resolve(ROOT, 'demo/src/App.tsx');
const appSrc = readFileSync(APP_TSX, 'utf8');

// Match: { id: 'some-id', ... }  or  id: 'some-id'
const navIds = new Set([...appSrc.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(([, id]) => id));

// ---------------------------------------------------------------------------
// 4. Check each component name against sections / nav ids
// ---------------------------------------------------------------------------

/**
 * Convert a PascalCase or camelCase component name to kebab-case and simple
 * lower-case for matching against section filenames and nav ids.
 *
 *   'TextInput'   → ['textinput', 'text-input']
 *   'navigation'  → ['navigation']
 *   'TokenBrowser'→ ['tokenbrowser', 'token-browser']
 *   'OTPInput'    → ['otpinput', 'otp-input']
 */
function toMatchKeys(name) {
  const lower = name.toLowerCase();
  // Two-pass regex: handles acronym boundaries (e.g. OTPInput → OTP-Input)
  // and standard camel-case transitions (e.g. TextInput → Text-Input).
  const kebab = name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
  return [lower, kebab];
}

const missing = [];

for (const name of [...componentNames].sort()) {
  // Skip excluded utility components
  if (EXCLUDED_COMPONENTS.has(name)) {
    continue;
  }

  // Check explicit component-to-section mapping
  if (COMPONENT_TO_SECTION_MAP[name]) {
    const targetId = COMPONENT_TO_SECTION_MAP[name];
    if (navIds.has(targetId) || sectionFiles.includes(targetId)) {
      continue; // covered by mapped section
    }
  }

  const keys = toMatchKeys(name);
  const inSections = keys.some((k) => sectionFiles.includes(k));
  const inNav = keys.some((k) =>
    [...navIds].some((id) => id === k || id.startsWith(k + '-') || id.endsWith('-' + k))
  );

  if (!inSections && !inNav) {
    missing.push(name);
  }
}

// ---------------------------------------------------------------------------
// 5. Report and exit
// ---------------------------------------------------------------------------

if (missing.length === 0) {
  const covered = componentNames.size - EXCLUDED_COMPONENTS.size;
  console.log(
    `✅  Demo coverage check passed — all ${covered} components are represented (${EXCLUDED_COMPONENTS.size} utility/internal excluded).`
  );
  process.exit(0);
} else {
  console.error(
    `❌  Demo coverage check FAILED — ${missing.length} component(s) have no demo section:\n`
  );
  for (const name of missing) {
    console.error(`    • ${name}`);
  }
  console.error(
    `\nAdd a section file under demo/src/sections/ or a nav entry in demo/src/App.tsx for each.\n` +
    `Or add an entry to COMPONENT_TO_SECTION_MAP in demo/scripts/check-coverage.mjs if the\n` +
    `component is covered within an existing multi-component section.`
  );
  process.exit(1);
}

