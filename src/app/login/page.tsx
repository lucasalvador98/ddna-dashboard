'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase';
import { sanitizeRedirectUrl } from '@/lib/redirect';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

// ─── Form (uses useSearchParams → must be wrapped in Suspense) ───────────────

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = sanitizeRedirectUrl(searchParams.get('redirect'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use shared browser client singleton — no new instance created
      const supabase = getBrowserClient();

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Map known Supabase auth errors to user-friendly Spanish messages
        if (authError.message.toLowerCase().includes('invalid login credentials')) {
          setError('Credenciales inválidas. Verificá tu email y contraseña.');
        } else if (authError.message.toLowerCase().includes('email not confirmed')) {
          setError('Email no confirmado. Revisá tu bandeja de entrada.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      // redirect() from next/navigation already handles client-side navigation safely
      router.push(redirect);
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-accent text-gray-600 mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="admin@ddna.org"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#334155] focus:border-transparent outline-none transition-all text-[#334155] placeholder-gray-400"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-accent text-gray-600 mb-1.5">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#334155] focus:border-transparent outline-none transition-all text-[#334155] placeholder-gray-400"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#334155] hover:bg-[#0F172A] text-white font-accent font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Ingresando...
          </>
        ) : (
          'Iniciar sesión'
        )}
      </button>
    </form>
  );
}

// ─── Skeleton (shown during Suspense fallback) ───────────────────────────────

function LoginSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-[72px] bg-gray-100 rounded-xl animate-pulse" />
      <div className="space-y-1.5">
        <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
      </div>
      <div className="space-y-1.5">
        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
      </div>
      <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* Brand header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-[#334155] rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-2xl text-[#334155]">DDNA Dashboard</h1>
            <p className="font-body text-sm text-gray-500 mt-1">
              Ingresá con tus credenciales para acceder
            </p>
          </div>

          <Suspense fallback={<LoginSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Defensoría de los Derechos de Niñas, Niños y Adolescentes
          <br />
          Provincia de Córdoba
        </p>
      </div>
    </div>
  );
}
