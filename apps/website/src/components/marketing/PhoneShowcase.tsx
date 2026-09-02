import Image from 'next/image';
import { BRAND_LOGO } from '@/lib/brand-logos';
import styles from './phone-showcase.module.css';

interface PhoneShowcaseProps {
  src: string;
  alt: string;
  size?: 'default' | 'large';
  priority?: boolean;
  branded?: boolean;
}

export function PhoneShowcase({
  src,
  alt,
  size = 'default',
  priority = false,
  branded = false,
}: PhoneShowcaseProps) {
  return (
    <div className={`${styles.wrap} ${size === 'large' ? styles.wrapLarge : ''}`}>
      <div className={styles.glow} aria-hidden="true" />
      <Image
        src={src}
        alt={alt}
        width={426}
        height={752}
        className={styles.phone}
        sizes="(min-width: 1024px) 320px, 70vw"
        priority={priority}
      />
      {branded ? (
        <div className={styles.logoBadge} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND_LOGO.onLightBg} alt="" className={styles.logo} />
        </div>
      ) : null}
    </div>
  );
}
