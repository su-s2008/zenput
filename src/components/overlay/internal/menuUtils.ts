/** CSS selector matching all non-disabled, focusable menu item elements. */
const MENU_ITEM_SELECTOR = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';

/**
 * Returns all enabled (non-disabled) menu item elements within `container`.
 */
export function getMenuItems(container: HTMLElement): HTMLElement[] {
  const all = container.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR);
  return Array.from(all).filter(
    (el) => el.getAttribute('aria-disabled') !== 'true' && el.dataset.disabled === undefined
  );
}

/**
 * Returns `true` when `target` is outside every element in `elements`.
 */
export function isOutsideAll(target: Node, elements: Array<HTMLElement | null>): boolean {
  return elements.every((el) => el == null || !el.contains(target));
}
