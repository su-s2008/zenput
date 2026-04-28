import React from 'react';
import { warnOnce } from './warnOnce';

type AnyProps = Record<string, unknown>;

/**
 * Merges `slotProps` with `childProps`:
 * - `className` values are concatenated (slot first, then child).
 * - `style` objects are merged (child properties win on conflicts).
 * - Matching event handlers are composed: the child handler fires first,
 *   then the slot handler — **unless the child called `event.preventDefault()`**,
 *   in which case the slot handler is skipped.
 * - All other props: child value wins.
 */
function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...slotProps };

  for (const key of Object.keys(childProps)) {
    const slotVal = slotProps[key];
    const childVal = childProps[key];

    if (key === 'className') {
      merged[key] = [slotVal, childVal].filter(Boolean).join(' ') || undefined;
    } else if (key === 'style') {
      merged[key] = {
        ...(slotVal as React.CSSProperties),
        ...(childVal as React.CSSProperties),
      };
    } else if (
      key.startsWith('on') &&
      typeof slotVal === 'function' &&
      typeof childVal === 'function'
    ) {
      merged[key] = (...args: unknown[]) => {
        (childVal as (...a: unknown[]) => void)(...args);
        // Skip the slot handler if the child handler cancelled the event.
        const firstArg = args[0];
        if (
          firstArg != null &&
          typeof firstArg === 'object' &&
          'defaultPrevented' in firstArg &&
          (firstArg as { defaultPrevented: boolean }).defaultPrevented
        ) {
          return;
        }
        (slotVal as (...a: unknown[]) => void)(...args);
      };
    } else {
      merged[key] = childVal;
    }
  }

  return merged;
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null): void {
  if (typeof ref === 'function') {
    ref(node);
  } else if (ref != null && 'current' in ref) {
    (ref as React.RefObject<T | null>).current = node;
  }
}

/**
 * Props accepted by `Slot`. Using `Record<string, unknown>` as the base
 * (rather than `HTMLAttributes<HTMLElement>`) lets consumers pass arbitrary
 * props — including non-HTML props like `href`, `to`, or framework-specific
 * attributes — without type assertions.
 */
export type SlotProps = Record<string, unknown> & {
  children?: React.ReactNode;
};

/**
 * Renders no element of its own — instead it clones its single React element
 * child and merges all props (className, style, event handlers, ref, etc.)
 * onto it.
 *
 * Used to implement the `asChild` pattern:
 * ```tsx
 * <Button asChild>
 *   <NextLink href="/x">Go</NextLink>
 * </Button>
 * ```
 *
 * ⚠️ `React.Fragment` is not a valid child — pass a single concrete element.
 */
export const Slot = React.forwardRef<Element, SlotProps>(function Slot(
  { children, ...slotProps },
  forwardedRef
) {
  if (!React.isValidElement(children)) {
    warnOnce(
      'Slot:invalid-child',
      'Slot requires a single valid React element as its child when used with asChild. ' +
        `Received: ${children === null ? 'null' : typeof children}. Rendering nothing.`
    );
    return null;
  }

  if (children.type === React.Fragment) {
    throw new Error(
      'Slot does not accept React.Fragment as a child. ' +
        'Pass a single non-Fragment element when using asChild.'
    );
  }

  // In React 19+ `ref` is a regular prop; in React <19 it lives on `element.ref`.
  // We read it from props first (React 19) and fall back to the legacy location.
  const childProps = children.props as AnyProps;
  const childRef =
    (childProps.ref as React.Ref<Element> | undefined) ??
    ((children as unknown as { ref?: React.Ref<Element> }).ref as React.Ref<Element> | undefined); // NOSONAR

  const merged = mergeProps(slotProps as AnyProps, childProps);

  // Merge the forwarded ref with any existing ref on the child.
  if (forwardedRef || childRef) {
    merged.ref = (node: Element | null) => {
      assignRef(forwardedRef, node);
      assignRef(childRef, node);
    };
  }

  return React.cloneElement(children, merged);
});

Slot.displayName = 'Slot';
