import { describe, it, expect } from 'vitest';
import { getMenuItems, isOutsideAll } from './menuUtils';

function el(role: string, disabled = false): HTMLElement {
  const node = document.createElement('div');
  node.setAttribute('role', role);
  if (disabled) {
    node.setAttribute('aria-disabled', 'true');
    node.setAttribute('data-disabled', '');
  }
  return node;
}

describe('getMenuItems', () => {
  it('returns all non-disabled menu items', () => {
    const container = document.createElement('div');
    container.appendChild(el('menuitem'));
    container.appendChild(el('menuitemcheckbox'));
    container.appendChild(el('menuitemradio'));
    const items = getMenuItems(container);
    expect(items).toHaveLength(3);
  });

  it('excludes items with aria-disabled="true"', () => {
    const container = document.createElement('div');
    container.appendChild(el('menuitem'));
    container.appendChild(el('menuitem', true));
    const items = getMenuItems(container);
    expect(items).toHaveLength(1);
  });

  it('excludes items with data-disabled attribute', () => {
    const container = document.createElement('div');
    const node = el('menuitem');
    node.setAttribute('data-disabled', '');
    container.appendChild(node);
    const items = getMenuItems(container);
    expect(items).toHaveLength(0);
  });

  it('returns empty array when container has no menu items', () => {
    const container = document.createElement('div');
    expect(getMenuItems(container)).toEqual([]);
  });
});

describe('isOutsideAll', () => {
  it('returns false when target is contained by one of the elements', () => {
    const parent = document.createElement('div');
    const child = document.createElement('span');
    parent.appendChild(child);
    expect(isOutsideAll(child, [parent])).toBe(false);
  });

  it('returns true when target is outside all elements', () => {
    const parent = document.createElement('div');
    const outside = document.createElement('span');
    expect(isOutsideAll(outside, [parent])).toBe(true);
  });

  it('returns true when elements array contains null entries', () => {
    const outside = document.createElement('span');
    expect(isOutsideAll(outside, [null, null])).toBe(true);
  });

  it('treats null elements as non-containing (target still outside)', () => {
    const parent = document.createElement('div');
    const child = document.createElement('span');
    parent.appendChild(child);
    // null entries must not throw and must not count as containing
    expect(isOutsideAll(child, [null, parent])).toBe(false);
  });
});
