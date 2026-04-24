/**
 * Emits a `console.warn` for a given key exactly once per session (in
 * development). Subsequent calls with the same key are no-ops.
 *
 * Gated on `process.env.NODE_ENV !== 'production'` so the overhead
 * tree-shakes cleanly in production builds. The Set is lazily allocated
 * so no module-level work happens in production.
 */

// Module-local process type; does not affect global or distributed types.
declare const process: undefined | { env?: { NODE_ENV?: string } };

// Lazily allocated so it is never created in production builds.
let warned: Set<string> | null = null;

export function warnOnce(key: string, message: string): void {
  // Safe typeof guard for browser environments without Node.js globals.
  if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production') return;
  if (warned === null) warned = new Set<string>();
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(message);
}
