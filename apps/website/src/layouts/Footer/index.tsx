import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Logo } from '@/layouts/Header/constants';
import { FooterDownload } from './FooterDownload';
import styles from './footer.module.css';
import { FOOTER_BACKGROUND, footerBrand, footerLinks, socialLinks } from './constants';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn(styles.footer, 'relative isolate z-[1]', className)}>
      <div className={styles.bgWrap} aria-hidden="true">
        <Image src={FOOTER_BACKGROUND} alt="" fill sizes="100vw" className={styles.bgImage} />
        <div className={styles.bgFade} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-10 xl:gap-x-10">
          <div className="min-w-0 lg:col-span-4 xl:col-span-4">
            <Link
              href="/"
              aria-label={`${footerBrand.name} home`}
              className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
            >
              <Logo tone="on-dark" className="h-7 w-auto sm:h-8" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70 sm:text-[0.9375rem]">
              {footerBrand.tagline}
            </p>
            <ul aria-label="Social links" className="mt-6 flex flex-wrap gap-2.5">
              {socialLinks.map(({ id, label, href, Icon, brandColor }) => (
                <li key={id}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={styles.socialIcon}
                    data-social={id}
                    style={{ '--social-brand': brandColor } as React.CSSProperties}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5 lg:gap-6">
            {footerLinks.map((section) => (
              <div key={section.title} className={styles.navColumn}>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                  {section.title}
                </p>
                <ul className="mt-4 space-y-0.5">
                  {section.links.map((item) => (
                    <li key={`${section.title}-${item.id}`}>
                      <Link
                        href={item.href}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noreferrer noopener' : undefined}
                        className={styles.navLink}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="min-w-0 lg:col-span-3 lg:pl-2">
            <FooterDownload />
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 sm:mt-12">
          <div className="flex flex-col items-center justify-between gap-2.5 text-center text-xs text-white/55 sm:flex-row sm:text-left sm:text-sm">
            <p className="shrink-0">
              © {year} {footerBrand.legalName}.
            </p>
            <p className="shrink-0">
              Made with <span aria-hidden>❤️</span> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
