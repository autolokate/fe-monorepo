import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { BLOG_ARTICLES } from './(site)/blog/data/articles';
import { MEDIA_ARTICLES } from './(site)/media/data/articles';

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

interface StaticRoute {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}

const STATIC_ROUTES: StaticRoute[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/pricing', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/how-it-works', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/features', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/products', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/emergency-safety', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/about-us', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/team', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/book-session', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/cars', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/bikes', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/cars/explore', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/bikes/explore', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/media', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/contact-us', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/grievance-redressal', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms-and-conditions', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/refund-and-cancellation', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/shipping-and-delivery', priority: 0.3, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogEntries = BLOG_ARTICLES.map((article) => ({
    url: absoluteUrl(`/blog/${article.slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const mediaEntries = MEDIA_ARTICLES.map((article) => ({
    url: absoluteUrl(`/media/articles/${article.slug}`),
    lastModified: new Date(article.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries, ...mediaEntries];
}
