import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BLOG_ARTICLES, getArticleBySlug, getRelatedArticles } from '../data/articles';
import { ArticleContent, ClosingCtaSection, RelatedReadsSection } from './';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: 'Article not found — Autolokate Blog' };
  }

  return {
    title: `${article.title} — Autolokate Blog`,
    description: article.excerpt,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `/blog/${article.slug}`,
      type: 'article',
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = getRelatedArticles(slug);

  return (
    <main className="relative">
      <ArticleContent article={article} />
      <RelatedReadsSection articles={related} />
      <ClosingCtaSection />
    </main>
  );
}
