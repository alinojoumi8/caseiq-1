import type { MetadataRoute } from 'next';
import { BUILD_MODE } from '@/lib/buildMode';

// The domain is undecided, so no host is invented: without NEXT_PUBLIC_SITE_URL the sitemap is empty.
// lastModified is left out on purpose; a build-time "now" would claim changes that did not happen.
// The here.now export writes every page as name/index.html with a trailing slash, so its URLs end in a slash.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '');
  if (!base) return [];
  const slash = BUILD_MODE === 'herenow' ? '/' : '';
  return [
    { url: `${base}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/film-text${slash}`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacy${slash}`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms${slash}`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/accessibility${slash}`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
