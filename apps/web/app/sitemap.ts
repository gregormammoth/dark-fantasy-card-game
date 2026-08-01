import type { MetadataRoute } from 'next';
import { getDocs } from '@/lib/content';
import { siteConfig } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const staticRoutes = [
    '',
    '/about',
    '/play',
    '/lore',
    '/regions',
    '/cards',
    '/classes',
    '/enemies',
    '/blog',
    '/roadmap',
    '/patch-notes',
    '/privacy',
    '/terms',
  ];

  const dynamicRoutes = [
    ...getDocs('lore').map((doc) => `/lore/${doc.slug}`),
    ...getDocs('regions').map((doc) => `/regions/${doc.slug}`),
    ...getDocs('blog').map((doc) => `/blog/${doc.slug}`),
    ...getDocs('patch-notes').map((doc) => `/patch-notes/${doc.slug}`),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/play' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/play' ? 0.9 : 0.6,
  }));
}
