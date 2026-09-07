'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface DraftData {
  data: Record<string, unknown>;
  timestamp: number;
  version: number;
}

const VERSION = 1;
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h
const DEBOUNCE_MS = 500;
const CHANNEL_NAME = 'monitoreo-draft';

function getKey(userId: string, formId: string): string {
  return `monitoreo:draft:${userId}:${formId || 'new'}`;
}

function safeGet(key: string): DraftData | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftData;
    if (!parsed || typeof parsed.timestamp !== 'number' || parsed.version !== VERSION) return null;
    if (Date.now() - parsed.timestamp > EXPIRY_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function safeSet(key: string, data: Record<string, unknown>): void {
  try {
    const payload: DraftData = { data, timestamp: Date.now(), version: VERSION };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // quota exceeded or SecurityError — ignore, don't break the form
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export interface UseMonitoreoDraftOptions {
  userId: string | null;
  formId: string;
  watch: Record<string, unknown>;
  onRestore?: (data: Record<string, unknown>) => void;
  enabled?: boolean;
}

export function useMonitoreoDraft({ userId, formId, watch, onRestore, enabled = true }: UseMonitoreoDraftOptions) {
  const key = userId ? getKey(userId, formId) : null;
  const channelRef = useRef<BroadcastChannel | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  // Setup BroadcastChannel
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const ch = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = ch;
    ch.onmessage = (ev: MessageEvent) => {
      if (ev.data?.type === 'draft-update' && ev.data?.key === key && onRestore && ev.data?.data) {
        // Optional: show banner instead of auto-restore if form is dirty
        // For now, do nothing — the storage event will handle cross-tab sync
      }
    };
    return () => {
      ch.close();
      channelRef.current = null;
    };
  }, [key, enabled, onRestore]);

  // Restore on mount
  useEffect(() => {
    if (!enabled || !key || !onRestore) return;
    const draft = safeGet(key);
    if (draft && draft.data && Object.keys(draft.data).length > 0) {
      // Only restore if draft is not expired (safeGet already checks) and has data
      onRestore(draft.data);
    }
  }, [key, enabled, onRestore]);

  // Listen to storage events (cross-tab sync via localStorage)
  useEffect(() => {
    if (!enabled || !key) return;
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue && onRestore) {
        try {
          const parsed = JSON.parse(e.newValue) as DraftData;
          if (parsed?.data && parsed.version === VERSION) {
            // Don't auto-restore if current tab is dirty — could show banner
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key, enabled, onRestore]);

  // Debounced save when watch changes
  useEffect(() => {
    if (!enabled || !key) return;
    if (!watch || Object.keys(watch).length === 0) return;

    // Avoid saving empty or unchanged
    const serialized = JSON.stringify(watch);
    if (serialized === lastSavedRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      safeSet(key, watch);
      lastSavedRef.current = serialized;
      // Notify other tabs
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'draft-update', key, data: watch });
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [watch, key, enabled]);

  // Flush on visibility hidden and beforeunload
  useEffect(() => {
    if (!enabled || !key) return;

    const flush = () => {
      if (!watch || Object.keys(watch).length === 0) return;
      const serialized = JSON.stringify(watch);
      if (serialized === lastSavedRef.current) return;
      safeSet(key, watch);
      lastSavedRef.current = serialized;
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'draft-update', key, data: watch });
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    const onBeforeUnload = () => {
      flush();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [watch, key, enabled]);

  const clearDraft = useCallback(() => {
    if (!key) return;
    safeRemove(key);
    lastSavedRef.current = '';
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'draft-clear', key });
    }
  }, [key]);

  const getDraft = useCallback((): DraftData | null => {
    if (!key) return null;
    return safeGet(key);
  }, [key]);

  return { clearDraft, getDraft, key };
}
