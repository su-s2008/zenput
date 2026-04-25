import { describe, it, expect, vi, beforeEach } from 'vitest';

// Re-import the module fresh for each test to reset the module-level `warned` set.
describe('warnOnce', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('emits console.warn on the first call with a given key', async () => {
    const { warnOnce } = await import('./warnOnce');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnOnce('test-key', 'Test message');
    expect(warnSpy).toHaveBeenCalledWith('Test message');
    warnSpy.mockRestore();
  });

  it('does not emit console.warn on subsequent calls with the same key', async () => {
    const { warnOnce } = await import('./warnOnce');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnOnce('dup-key', 'First');
    warnOnce('dup-key', 'Second');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  it('emits independently for different keys', async () => {
    const { warnOnce } = await import('./warnOnce');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnOnce('key-a', 'Message A');
    warnOnce('key-b', 'Message B');
    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });
});
