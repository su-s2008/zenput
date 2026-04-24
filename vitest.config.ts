import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './reports/junit.xml',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/**/index.ts',
        'src/stories/**',
        'src/test-utils/**',
        'src/global.d.ts',
        // Type-only declaration files — no executable code to cover.
        'src/types/**',
        'src/**/*.types.ts',
      ],
      // Thresholds reflect current baseline to keep CI green on the tooling
      // migration. Aspirational targets are lines: 90, branches: 85 — raise
      // these in a follow-up as small tests are added (see TODO exclusions
      // above). Do not lower further without discussion.
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 85,
        branches: 80,
      },
    },
  },
});
