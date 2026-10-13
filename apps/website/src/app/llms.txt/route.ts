import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SUPPORT_EMAIL,
  SITE_TAGLINE,
  absoluteUrl,
} from '@/lib/seo';
import { FAQS as ABOUT_FAQS } from '../(site)/about-us/components/FaqGrid/constants';
import { BLOG_ARTICLES } from '../(site)/blog/data/articles';
import { MECHANICS_FAQS } from '../(site)/how-it-works/components/MechanicsFaqSection/constants';
import { MEDIA_ARTICLES } from '../(site)/media/data/articles';
import { BILLING_FAQS } from '../(site)/pricing/components/BillingFaqSection/constants';

export const dynamic = 'force-static';

const KEY_PAGES: ReadonlyArray<{ path: string; title: string; summary: string }> = [
  { path: '/', title: 'Home', summary: 'What Autolokate is and how it protects every drive.' },
  {
    path: '/how-it-works',
    title: 'How it works',
    summary: 'Crash detection, Control Center coordination and the Smart QR backup, step by step.',
  },
  {
    path: '/pricing',
    title: 'Pricing',
    summary: 'Yearly per-vehicle plans, what each covers, billing FAQs.',
  },
  {
    path: '/features',
    title: 'Features',
    summary: 'Safety, daily utility and garage features in the app.',
  },
  {
    path: '/products',
    title: 'Products',
    summary: 'The Autolokate app, Smart QR sticker and Control Center.',
  },
  {
    path: '/emergency-safety',
    title: 'Emergency safety',
    summary: 'What happens after a crash and how help is coordinated.',
  },
  {
    path: '/about-us',
    title: 'About us',
    summary: 'Mission, founder and frequently asked questions.',
  },
  { path: '/contact-us', title: 'Contact', summary: 'Support channels and business enquiries.' },
];

function faqSection(title: string, items: ReadonlyArray<{ question: string; answer: string }>) {
  return [`## ${title}`, '', ...items.map((item) => `- **${item.question}** ${item.answer}`), ''];
}

export function GET() {
  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_TAGLINE}. ${SITE_DESCRIPTION}`,
    '',
    `Support: ${SITE_SUPPORT_EMAIL}. Serving drivers across India. In an emergency, call 112 — Autolokate works alongside official services.`,
    '',
    '## Key pages',
    '',
    ...KEY_PAGES.map((page) => `- [${page.title}](${absoluteUrl(page.path)}): ${page.summary}`),
    '',
    ...faqSection('About Autolokate', ABOUT_FAQS),
    ...faqSection('How it works', MECHANICS_FAQS),
    ...faqSection('Pricing and billing', BILLING_FAQS),
    '## Guides',
    '',
    ...BLOG_ARTICLES.map(
      (article) =>
        `- [${article.title}](${absoluteUrl(`/blog/${article.slug}`)}): ${article.excerpt}`,
    ),
    ...MEDIA_ARTICLES.map(
      (article) =>
        `- [${article.title}](${absoluteUrl(`/media/articles/${article.slug}`)}): ${article.excerpt}`,
    ),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
