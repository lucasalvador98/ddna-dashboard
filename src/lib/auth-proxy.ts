import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { sanitizeRedirectUrl } from '@/lib/redirect';
import { getAuthSettings } from '@/lib/auth-settings';

// ─── Auth Proxy ───────────────────────────────────────────────────────────────

export async function authProxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  const settings = await getAuthSettings();

  if (!settings.enabled) {
    return NextResponse.next();
  }

  const isProtected = settings.protected_routes.some(
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
    const loginUrl = new URL('/login', request.url);
    const originalPath = pathname + (searchParams.size > 0 ? `?${searchParams}` : '');
    loginUrl.searchParams.set('redirect', sanitizeRedirectUrl(originalPath, '/'));
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
