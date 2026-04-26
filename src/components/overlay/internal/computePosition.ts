/**
 * Shared floating-element position computation used by Popover, Tooltip, Menu,
 * and the imperative PopoverProvider. Calculates absolute `top`/`left`
 * coordinates (in viewport / fixed-position space) for a floating element
 * anchored to a trigger rect.
 */

export type OverlaySide = 'top' | 'bottom' | 'left' | 'right';
export type OverlayAlign = 'start' | 'center' | 'end';

/**
 * Compute the position along the alignment axis (perpendicular to `side`).
 * Returns the coordinate (left for top/bottom sides, top for left/right sides).
 */
function computeAlignmentCoord(
  triggerStart: number,
  triggerSize: number,
  contentSize: number,
  align: OverlayAlign,
  alignOffset: number
): number {
  if (align === 'start') return triggerStart + alignOffset;
  if (align === 'end') return triggerStart + triggerSize - contentSize - alignOffset;
  return triggerStart + triggerSize / 2 - contentSize / 2 + alignOffset;
}

/**
 * Compute absolute `top`/`left` from the trigger rect, content rect, side,
 * and alignment. Returns viewport-space coordinates suitable for
 * `position: fixed` elements.
 *
 * @param trigger   - Bounding rect of the anchor / trigger element.
 * @param content   - Bounding rect of the floating content element.
 * @param side      - Preferred side relative to the trigger.
 * @param align     - Alignment along the perpendicular axis.
 * @param sideOffset  - Gap (px) between trigger and content along the main axis.
 * @param alignOffset - Offset (px) along the alignment axis. Default: `0`.
 */
export function computePosition(
  trigger: DOMRect,
  content: DOMRect,
  side: OverlaySide,
  align: OverlayAlign,
  sideOffset: number,
  alignOffset = 0
): { top: number; left: number } {
  let top: number;
  let left: number;

  if (side === 'top' || side === 'bottom') {
    top = side === 'top' ? trigger.top - content.height - sideOffset : trigger.bottom + sideOffset;
    left = computeAlignmentCoord(trigger.left, trigger.width, content.width, align, alignOffset);
  } else {
    left = side === 'left' ? trigger.left - content.width - sideOffset : trigger.right + sideOffset;
    top = computeAlignmentCoord(trigger.top, trigger.height, content.height, align, alignOffset);
  }

  // Clamp to viewport to avoid overflow.
  const vw = typeof window === 'undefined' ? 0 : window.innerWidth;
  const vh = typeof window === 'undefined' ? 0 : window.innerHeight;
  left = Math.max(4, Math.min(left, vw - content.width - 4));
  top = Math.max(4, Math.min(top, vh - content.height - 4));

  return { top, left };
}
