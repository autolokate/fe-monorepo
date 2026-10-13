import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  MEDIA_ARTICLES,
  getMediaArticleBySlug,
  getRelatedMediaArticles,
} from '../../data/articles';
import { ClosingCtaSection } from '../../components/ClosingCtaSection';
import { ArticleBody } from './components/ArticleBody';
import { RelatedArticles } from './components/RelatedArticles';
import { JsonLd } from '@/components/seo/JsonLd';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return MEDIA_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getMediaArticleBySlug(slug);

  if (!article) {
    return { title: 'Article not found — Autolokate Media' };
  }

  return {
    title: `${article.title} — Autolokate Media`,
    description: article.excerpt,
    alternates: { canonical: `/media/articles/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `/media/articles/${article.slug}`,
      type: 'article',
      images: [{ url: article.coverImage }],
    },
  };
}

export default async function MediaArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getMediaArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = getRelatedMediaArticles(slug);

  const path = `/media/articles/${article.slug}`;

  return (
    <main className="relative">
      <JsonLd
        data={[
          articleJsonLd({
            path,
            headline: article.title,
            description: article.excerpt,
            author: article.author,
            image: article.coverImage,
            datePublished: article.date,
            section: article.category,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Media', path: '/media' },
            { name: article.title, path },
          ]),
        ]}
      />
      <ArticleBody article={article} />
      <RelatedArticles articles={related} />
      <ClosingCtaSection />
    </main>
  );
}
