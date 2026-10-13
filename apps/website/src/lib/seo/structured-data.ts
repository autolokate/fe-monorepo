import {
  SITE_DESCRIPTION,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_SOCIAL_PROFILES,
  SITE_SUPPORT_EMAIL,
  SITE_URL,
  absoluteUrl,
} from './site';

/** Schema.org node — kept loose because each `@type` has its own shape. */
export type JsonLdNode = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationJsonLd(): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(SITE_LOGO_PATH),
    description: SITE_DESCRIPTION,
    email: SITE_SUPPORT_EMAIL,
    areaServed: { '@type': 'Country', name: 'India' },
    sameAs: SITE_SOCIAL_PROFILES,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: SITE_SUPPORT_EMAIL,
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  };
}

export function websiteJsonLd(): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'en-IN',
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/** FAQPage — lets search and answer engines quote our answers directly. */
export function faqPageJsonLd(items: readonly FaqEntry[]): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export interface ArticleJsonLdInput {
  path: string;
  headline: string;
  description: string;
  author: string;
  image?: string;
  datePublished?: string;
  section?: string;
}

export function articleJsonLd(input: ArticleJsonLdInput): JsonLdNode {
  const url = absoluteUrl(input.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    headline: input.headline,
    description: input.description,
    ...(input.image ? { image: [absoluteUrl(input.image)] } : {}),
    ...(input.datePublished
      ? { datePublished: input.datePublished, dateModified: input.datePublished }
      : {}),
    ...(input.section ? { articleSection: input.section } : {}),
    inLanguage: 'en-IN',
    author: { '@type': 'Organization', name: input.author, url: SITE_URL },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export interface BreadcrumbEntry {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: readonly BreadcrumbEntry[]): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
