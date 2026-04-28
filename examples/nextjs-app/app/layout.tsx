import type { Metadata } from 'next';
import { getColorModeScript } from 'zenput/server';

export const metadata: Metadata = {
  title: 'Zenput Next.js App Router Smoke Test',
  description: 'Verifies zenput works with Next.js App Router',
};

/**
 * Root layout — a **Server Component**.
 *
 * Imports `getColorModeScript` from `zenput/server` (which has no React
 * imports and is safe to use in a Server Component). The inline script sets
 * `data-zp-theme` on `<html>` before first paint so CSS variables are already
 * scoped correctly, avoiding a flash of wrong colour scheme.
 *
 * The `storageKey` passed here must match the one passed to `<ThemeProvider>`
 * in the client tree, so both sides read and write the same storage entry.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/*
         * Inline script sets data-zp-theme on <html> before paint.
         * Works together with <ThemeProvider storageKey="zp-theme"> to keep
         * the pre-hydration attribute and the React-rendered tokens in sync.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: getColorModeScript({ storageKey: 'zp-theme' }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
