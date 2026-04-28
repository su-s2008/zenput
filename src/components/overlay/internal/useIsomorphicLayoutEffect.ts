'use client';
import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` on the client, `useEffect` on the server.
 *
 * This avoids the React "useLayoutEffect does nothing on the server"
 * warning for components (e.g. Popover, Tooltip) that need to measure
 * and position DOM nodes synchronously after mount but may still be
 * rendered during SSR.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
