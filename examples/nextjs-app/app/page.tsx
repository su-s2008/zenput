/**
 * Root page — a **Server Component**.
 *
 * Demonstrates that it is safe to import zenput token utilities
 * (from `zenput/tokens`) in a Server Component, and that client
 * components (wrapped with 'use client') render without errors.
 */
import { CSS_VAR_PREFIX, cssVar } from 'zenput/tokens';
import ZenputClientDemo from '../components/ZenputClientDemo';

export default function Home() {
  // These token helpers run entirely on the server — no hooks, no browser APIs.
  const brandVar = cssVar('color-brand');
  const prefix = CSS_VAR_PREFIX;

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Zenput — Next.js App Router Smoke Test</h1>
      <p>
        CSS variable prefix: <code>{prefix}</code>
        <br />
        Brand CSS var: <code>{brandVar}</code>
      </p>

      {/*
       * Client components are imported here and must have 'use client' in
       * their bundle. If the directive is missing, Next.js will throw at
       * build time with "You're importing a component that needs ... hooks".
       */}
      <ZenputClientDemo />
    </main>
  );
}
