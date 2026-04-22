import { classNames, cn } from './classNames';

describe('classNames', () => {
  it('joins string arguments with spaces', () => {
    expect(classNames('a', 'b', 'c')).toBe('a b c');
  });

  it('ignores falsy values (undefined, null, false, empty string)', () => {
    expect(classNames('a', undefined, null, false, '', 'b')).toBe('a b');
  });

  it('includes object keys whose value is truthy', () => {
    expect(classNames({ active: true, disabled: false, hidden: true })).toBe('active hidden');
  });

  it('mixes strings and object maps in order', () => {
    expect(classNames('base', { active: true, error: false }, 'extra')).toBe('base active extra');
  });

  it('returns an empty string when no classes apply', () => {
    expect(classNames(undefined, false, { off: false })).toBe('');
  });

  it('exposes `cn` as an alias of classNames', () => {
    expect(cn).toBe(classNames);
  });
});
