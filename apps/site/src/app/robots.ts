import type { MetadataRoute } from 'next';
import { BUILD_MODE } from '@/lib/buildMode';

// Default build: allow everything except the API. The sitemap line appears only once the domain is set.
// here.now preview: disallow everything, and leave out the sitemap line, so crawlers have nothing to follow.
export default function robots(): MetadataRoute.Robots {
  if (BUILD_MODE === 'herenow') return { rules: { userAgent: '*', disallow: '/' } };
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '');
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api' },
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}
