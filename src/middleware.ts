import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ─── Settings cache (in-memory, per-middleware-instance) ──────────────────────

interface AuthSettings {
  enabled: boolean;
  protectedRoutes: string[];
}

let cachedSettings: AuthSettings | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5_000; // 5 seconds — faster response to admin changes

async function getAuthSettings(): Promise<AuthSettings> {
  const now = Date.now();
  if (cachedSettings && now - cacheTimestamp < CACHE_TTL) {
    return cachedSettings;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    cachedSettings = { enabled: false, protectedRoutes: [] };
    cacheTimestamp = now;
    return cachedSettings;
  }

  try {
    // Use raw fetch to avoid @supabase/supabase-js in Edge runtime middleware
    const res = await fetch(`${supabaseUrl}/rest/v1/settings?key=eq.auth&select=value`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      // Disable fetch cache so Next.js doesn't hold stale responses
      cache: 'no-store',
    });

    if (!res.ok) {
      cachedSettings = { enabled: false, protectedRoutes: [] };
      cacheTimestamp = now;
      return cachedSettings;
    }

    const rows = (await res.json()) as Array<{ value: Record<string, unknown> }>;
    const value = rows?.[0]?.value as { enabled?: boolean; protected_routes?: string[] } | null;

    cachedSettings = {
      enabled: value?.enabled ?? false,
      protectedRoutes: value?.protected_routes ?? [],
    };
  } catch {
    // If settings fetch fails, default to auth-disabled (safe fallback)
    cachedSettings = { enabled: false, protectedRoutes: [] };
  }

  cacheTimestamp = now;
  return cachedSettings;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Never interfere with login, API routes, or Next.js internals
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  const settings = await getAuthSettings();

  // Auth disabled → allow everything
  if (!settings.enabled) {
    return NextResponse.next();
  }

  // Check if this route is protected
  const isProtected = settings.protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // ─── Session check ────────────────────────────────────────────────────────

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    // Build redirect URL preserving the original path and query params
    const loginUrl = new URL('/login', request.url);
    const originalPath = pathname + (searchParams.size > 0 ? `?${searchParams}` : '');
    loginUrl.searchParams.set('redirect', originalPath);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

// ─── Matcher ─────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - Static media files (.svg, .png, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
