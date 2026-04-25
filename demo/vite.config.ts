import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// The demo imports Zenput directly from the repo source via an alias.
// This means the demo always renders the current in-repo version of the
// design system without requiring the library to be built first.

// Packages that must resolve from demo/node_modules, not from ../src's ancestor
// node_modules path. When Rolldown bundles ../src/** files it starts resolution
// from ../src and walks up that directory tree — it never enters demo/node_modules.
// Listing them here tells Vite to deduplicate to the copy it already resolved for
// the demo app itself, preventing the "failed to resolve import" hard error.
const DEDUPED_PEER_DEPS = ['react', 'react-dom', 'react/jsx-runtime'];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      zenput: path.resolve(__dirname, '../src'),
    },
    dedupe: DEDUPED_PEER_DEPS,
  },
  server: {
    port: 5173,
    open: true,
  },
});
