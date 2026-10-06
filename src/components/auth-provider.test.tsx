import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const mocks = vi.hoisted(() => ({
  configured: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn<(callback: (event: AuthChangeEvent, session: Session | null) => void) => {
    data: { subscription: { unsubscribe: () => void } };
  }>(),
  signOut: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: mocks.configured,
  getBrowserClient: () => ({ auth: {
    getSession: mocks.getSession,
    onAuthStateChange: mocks.onAuthStateChange,
    signOut: mocks.signOut,
  } }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));

import { AuthProvider, useAuth } from './auth-provider';

function State() {
  const { loading, user } = useAuth();
  return <span>{`${loading ? 'loading' : 'ready'}:${user?.id ?? 'anonymous'}`}</span>;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.configured.mockReturnValue(true);
  mocks.getSession.mockResolvedValue({ data: { session: null } });
  mocks.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
});

describe('reconciled auth provider', () => {
  it('renders ready immediately when Supabase is not configured', () => {
    mocks.configured.mockReturnValue(false);
    const renderedStates: boolean[] = [];
    function Capture() {
      renderedStates.push(useAuth().loading);
      return <State />;
    }
    render(<AuthProvider><Capture /></AuthProvider>);
    expect(renderedStates).toEqual([false]);
    expect(screen.getByText('ready:anonymous')).toBeInTheDocument();
    expect(mocks.getSession).not.toHaveBeenCalled();
  });

  it('keeps the newer main behavior that clears a session on SIGNED_OUT', async () => {
    const session: Session = {
      access_token: 'unit-access-token', refresh_token: 'unit-refresh-token',
      token_type: 'bearer', expires_in: 3600,
      user: { id: 'unit-user', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' },
    };
    mocks.getSession.mockResolvedValue({ data: { session } });
    render(<AuthProvider><State /></AuthProvider>);
    await waitFor(() => expect(screen.getByText('ready:unit-user')).toBeInTheDocument());
    act(() => mocks.onAuthStateChange.mock.calls[0][0]('SIGNED_OUT', null));
    expect(screen.getByText('ready:anonymous')).toBeInTheDocument();
  });
});
