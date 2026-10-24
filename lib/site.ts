/**
 * Canonical site origin used by metadata, robots and the sitemap.
 *
 * Resolution order:
 * 1. NEXT_PUBLIC_SITE_URL (set this to your custom domain or Vercel URL)
 * 2. VERCEL_PROJECT_PRODUCTION_URL (injected by Vercel for the production domain)
 * 3. VERCEL_URL (injected by Vercel for the current deployment/preview)
 * 4. localhost fallback for local development
 */
function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return `https://${stripTrailingSlash(vercelProduction)}`;

  const vercelDeployment = process.env.VERCEL_URL?.trim();
  if (vercelDeployment) return `https://${stripTrailingSlash(vercelDeployment)}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
