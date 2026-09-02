import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AlMark } from '@/layouts/Header/constants';
import { FooterDownload } from './FooterDownload';
import styles from './footer.module.css';
import { footerBrand, footerLinks, socialLinks } from './constants';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn(styles.footer, className)}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div>
            <Link href="/" aria-label={`${footerBrand.name} home`} className={styles.brandLink}>
              <AlMark className={styles.brandMark} />
              <span className={styles.brandWord}>utolokate</span>
            </Link>
            <p className={styles.tagline}>{footerBrand.tagline}</p>
            <p className={styles.controlCenter}>{footerBrand.controlCenter}</p>
            <a href={`mailto:${footerBrand.email}`} className={styles.email}>
              {footerBrand.email}
            </a>
          </div>

          <div className={styles.columns}>
            {footerLinks.map((section) => (
              <div key={section.title} className={styles.navColumn}>
                <p className={styles.eyebrow}>{section.title}</p>
                <ul className={styles.navList}>
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

          <FooterDownload />
        </div>

        <ul aria-label="Social links" className={styles.social}>
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
                <Icon className="h-5 w-5" />
              </a>
            </li>
          ))}
        </ul>

        <hr className={styles.divider} />

        <div className={styles.bottom}>
          <p>
            © {year} {footerBrand.legalName}. Made in India.
          </p>
          <p>{footerBrand.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
