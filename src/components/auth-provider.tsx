'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient, isSupabaseConfigured } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

/**
 * Hook to access the current auth state.
 * Returns { session, user, loading, signOut }.
 * Must be used within <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

/**
 * AuthProvider — wraps the app and provides session state via React Context.
 * Uses the shared browser client from supabase.ts (singleton).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Use shared browser client singleton — no new instance created
  const [supabase] = useState(() => (isSupabaseConfigured() ? getBrowserClient() : null));

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Hydrate initial session from cookies (SSR middleware may have set them)
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (mounted) {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setLoading(false);
      }
    });

    // Subscribe to auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;

      // Real sign-out (supabase.auth.signOut()) fires SIGNED_OUT with no new
      // session. A stale session must never survive it: clear state immediately
      // instead of preserving a previous session. A transient SIGNED_OUT may
      // briefly re-render toward the login state — acceptable, a stale session
      // is worse than a brief flash.
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      // Normal session update
      setSession((prev) => {
        if (prev?.access_token === newSession?.access_token && prev?.user?.id === newSession?.user?.id) {
          return prev;
        }
        return newSession;
      });
      setUser((prev) => {
        if (prev?.id === newSession?.user?.id) return prev;
        return newSession?.user ?? null;
      });
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        // A failed server-side sign-out must still clear local state so the UI
        // never keeps a stale session; surface the failure for debugging.
        console.error('signOut failed:', error);
      }
    }

    // Clear local state explicitly so the UI reflects the result immediately,
    // even if the SIGNED_OUT event is missed — then always land on /login.
    setSession(null);
    setUser(null);
    setLoading(false);
    router.replace('/login');
    router.refresh();
  }, [supabase, router]);

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
