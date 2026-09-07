import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMonitoreoDraft } from './useMonitoreoDraft';

describe('useMonitoreoDraft', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('persists and restores draft', async () => {
    const onRestore = vi.fn();
    const { rerender } = renderHook(
      ({ watch }) =>
        useMonitoreoDraft({
          userId: 'user-1',
          formId: 'new',
          watch,
          onRestore,
          enabled: true,
        }),
      { initialProps: { watch: {} } }
    );

    // Change watch to trigger debounce save
    rerender({ watch: { medio: 'Test', titulo: 'Hola' } as any });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 600));
    });

    const raw = localStorage.getItem('monitoreo:draft:user-1:new');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.data.medio).toBe('Test');

    // New hook instance should restore
    const onRestore2 = vi.fn();
    renderHook(() =>
      useMonitoreoDraft({
        userId: 'user-1',
        formId: 'new',
        watch: {},
        onRestore: onRestore2,
        enabled: true,
      })
    );
    // onRestore is called in useEffect, need to wait a tick
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(onRestore2).toHaveBeenCalled();
  });

  it('clears draft', async () => {
    localStorage.setItem('monitoreo:draft:user-1:new', JSON.stringify({ data: { a: 1 }, timestamp: Date.now(), version: 1 }));
    const { result } = renderHook(() =>
      useMonitoreoDraft({
        userId: 'user-1',
        formId: 'new',
        watch: {},
        enabled: true,
      })
    );
    act(() => {
      result.current.clearDraft();
    });
    expect(localStorage.getItem('monitoreo:draft:user-1:new')).toBeNull();
  });

  it('does not throw if localStorage fails', () => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error('QuotaExceeded');
    };
    expect(() => {
      renderHook(() =>
        useMonitoreoDraft({
          userId: 'user-1',
          formId: 'new',
          watch: { medio: 'x' } as any,
          enabled: true,
        })
      );
    }).not.toThrow();
    Storage.prototype.setItem = original;
  });
});
