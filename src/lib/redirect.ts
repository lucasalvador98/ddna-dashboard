export function sanitizeRedirectUrl(url: string | null, fallback: string = '/'): string {
  if (!url) return fallback;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  return fallback;
}
