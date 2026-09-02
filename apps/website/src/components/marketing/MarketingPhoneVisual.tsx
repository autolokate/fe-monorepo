'use client';

import Image from 'next/image';
import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';
import styles from './marketing-phone-visual.module.css';

export type PhoneAssetVariant = 'incident' | 'detection' | 'control' | 'protected';

const PHONE_ASSETS: Record<PhoneAssetVariant, { src: string; width: number; height: number }> = {
  incident: {
    src: MARKETING_STORY_IMAGES.controlCenterPhone,
    width: 527,
    height: 1024,
  },
  detection: {
    src: MARKETING_STORY_IMAGES.detectionRadar,
    width: 853,
    height: 1844,
  },
  control: {
    src: MARKETING_STORY_IMAGES.controlCenterPhone,
    width: 527,
    height: 1024,
  },
  protected: {
    src: MARKETING_STORY_IMAGES.controlCenterPhone,
    width: 527,
    height: 1024,
  },
};

interface MarketingPhoneVisualProps {
  variant?: PhoneAssetVariant;
  /** subtle pulse ring — for live / connecting states */
  live?: boolean;
  /** red impact flash */
  alert?: boolean;
  className?: string;
  priority?: boolean;
}

export function MarketingPhoneVisual({
  variant = 'incident',
  live = false,
  alert = false,
  className,
  priority = false,
}: MarketingPhoneVisualProps) {
  const asset = PHONE_ASSETS[variant];

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      {live ? <div className={styles.liveRing} aria-hidden="true" /> : null}
      {alert ? <div className={styles.alertFlash} aria-hidden="true" /> : null}
      <Image
        src={asset.src}
        alt=""
        width={asset.width}
        height={asset.height}
        className={styles.phone}
        sizes="(min-width: 1024px) 280px, 55vw"
        priority={priority}
        aria-hidden
      />
    </div>
  );
}
