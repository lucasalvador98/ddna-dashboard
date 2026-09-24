/**
 * Prefixes browser-side URLs that are not handled by Next.js Link/router.
 * NEXT_PUBLIC_BASE_PATH is fixed during the Docker build; empty keeps the
 * existing root deployment compatible with Vercel.
 */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');

export function dashboardPath(path: string): string {
  return `${basePath}/${path.replace(/^\//, '')}`;
}
