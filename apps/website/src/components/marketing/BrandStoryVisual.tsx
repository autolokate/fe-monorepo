import { BRAND_LOGO } from '@/lib/brand-logos';
import Image from 'next/image';
import styles from './brand-story-visual.module.css';

interface BrandStoryVisualProps {
  src: string;
  alt: string;
  variant?: 'photo' | 'phone';
  priority?: boolean;
  sizes?: string;
}

export function BrandStoryVisual({
  src,
  alt,
  variant = 'photo',
  priority = false,
  sizes = '(min-width: 1024px) 42vw, 100vw',
}: BrandStoryVisualProps) {
  return (
    <div className={`${styles.frame} ${variant === 'phone' ? styles.framePhone : ''}`}>
      <Image
        src={src}
        alt={alt}
        fill={variant === 'photo'}
        width={variant === 'phone' ? 426 : undefined}
        height={variant === 'phone' ? 752 : undefined}
        className={variant === 'photo' ? styles.photo : styles.phone}
        sizes={sizes}
        priority={priority}
      />
      <div className={styles.logoBadge} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BRAND_LOGO.onLightBg} alt="" className={styles.logo} />
      </div>
    </div>
  );
}
