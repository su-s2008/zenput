import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

/**
 * Rollup plugin that preserves `'use client'` and `'use server'` directives
 * in the bundle output. Rollup treats these as dead code (unused string
 * expressions) and removes them by default. This plugin detects the directive
 * present in the entry chunk's leading block, strips all per-module occurrences,
 * and re-hoists the detected directive to the very first line of the emitted
 * file, which is required for Next.js App Router / React Server Components to
 * honour the boundary.
 *
 * Only applied to entry chunks; non-entry chunks (code-split async chunks) are
 * left unchanged.
 */
function preserveDirectives() {
  return {
    name: 'preserve-directives',
    renderChunk(code, chunk) {
      // Only hoist directives for entry chunks; async split chunks don't need them.
      if (!chunk.isEntry) return null;

      // Strip all occurrences, then check whether anything was removed.
      // Using replace with the global flag is safer than .test() + .replace()
      // because .test() on a global regex mutates lastIndex.
      const directiveRe = /^(?:'use client'|"use client"|'use server'|"use server");?\s*/gm;
      const stripped = code.replace(directiveRe, '');
      if (stripped === code) return null;

      // Detect which directive type was present so we hoist the correct one.
      // Default to 'use client' since all our entry bundles are client-only.
      const directiveMatch = code.match(/'use server'|"use server"/);
      const directive = directiveMatch ? `'use server'` : `'use client'`;

      return { code: `${directive};\n${stripped}`, map: null };
    },
  };
}

const basePlugins = ({ declaration, declarationDir }) => [
  peerDepsExternal(),
  resolve(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    rootDir: 'src',
    declaration,
    declarationDir: declaration ? declarationDir : undefined,
  }),
  postcss({ modules: true, extract: false }),
];

/** Plugins for server-safe bundles (no React, no 'use client'). */
const serverPlugins = ({ declaration, declarationDir }) => [
  peerDepsExternal(),
  resolve(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    rootDir: 'src',
    declaration,
    declarationDir: declaration ? declarationDir : undefined,
  }),
];

const external = ['react', 'react-dom', 'react-hook-form', '@hookform/resolvers/zod', 'zod'];

/** Banner prepended to every client-side bundle entry. */
const clientBanner = "'use client';";

export default [
  // ---------------------------------------------------------------------------
  // Core entry – CJS
  // ---------------------------------------------------------------------------
  {
    input: 'src/index.ts',
    output: { file: 'dist/cjs/index.js', format: 'cjs', sourcemap: true, banner: clientBanner },
    plugins: [...basePlugins({ declaration: true, declarationDir: 'dist/cjs/types' }), preserveDirectives()],
    external,
  },
  // Core entry – ESM
  {
    input: 'src/index.ts',
    output: { file: 'dist/esm/index.js', format: 'esm', sourcemap: true, banner: clientBanner },
    plugins: [...basePlugins({ declaration: false }), preserveDirectives()],
    external,
  },
  // Core entry – DTS
  {
    input: 'dist/cjs/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/],
  },

  // ---------------------------------------------------------------------------
  // forms subpath – CJS
  // ---------------------------------------------------------------------------
  {
    input: 'src/forms/index.ts',
    output: { file: 'dist/cjs/forms/index.js', format: 'cjs', sourcemap: true, banner: clientBanner },
    plugins: [...basePlugins({ declaration: true, declarationDir: 'dist/cjs/forms/types' }), preserveDirectives()],
    external,
  },
  // forms subpath – ESM
  {
    input: 'src/forms/index.ts',
    output: { file: 'dist/esm/forms/index.js', format: 'esm', sourcemap: true, banner: clientBanner },
    plugins: [...basePlugins({ declaration: false }), preserveDirectives()],
    external,
  },
  // forms subpath – DTS
  {
    input: 'dist/cjs/forms/types/forms/index.d.ts',
    output: [{ file: 'dist/forms/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/, 'react-hook-form', '@hookform/resolvers/zod', 'zod'],
  },

  // ---------------------------------------------------------------------------
  // tokens subpath – server-safe, no 'use client'
  // ---------------------------------------------------------------------------
  {
    input: 'src/tokens/index.ts',
    output: { file: 'dist/cjs/tokens/index.js', format: 'cjs', sourcemap: true },
    plugins: serverPlugins({ declaration: true, declarationDir: 'dist/cjs/tokens/types' }),
    external,
  },
  {
    input: 'src/tokens/index.ts',
    output: { file: 'dist/esm/tokens/index.js', format: 'esm', sourcemap: true },
    plugins: serverPlugins({ declaration: false }),
    external,
  },
  {
    input: 'dist/cjs/tokens/types/tokens/index.d.ts',
    output: [{ file: 'dist/tokens/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/],
  },

  // ---------------------------------------------------------------------------
  // server subpath – server-safe helpers, no 'use client'
  // ---------------------------------------------------------------------------
  {
    input: 'src/server/index.ts',
    output: { file: 'dist/cjs/server/index.js', format: 'cjs', sourcemap: true },
    plugins: serverPlugins({ declaration: true, declarationDir: 'dist/cjs/server/types' }),
    external,
  },
  {
    input: 'src/server/index.ts',
    output: { file: 'dist/esm/server/index.js', format: 'esm', sourcemap: true },
    plugins: serverPlugins({ declaration: false }),
    external,
  },
  {
    input: 'dist/cjs/server/types/server/index.d.ts',
    output: [{ file: 'dist/server/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/],
  },
];
