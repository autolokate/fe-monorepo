'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { BRAND_LOGO } from '@/lib/brand-logos';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './story-video-visual.module.css';

interface StoryVideoVisualProps {
  videoSrc: string;
  posterSrc: string;
  alt: string;
  priority?: boolean;
}

export function StoryVideoVisual({
  videoSrc,
  posterSrc,
  alt,
  priority = false,
}: StoryVideoVisualProps) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return;

    const play = () => {
      void video.play().catch(() => {});
    };

    video.addEventListener('canplay', play);
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      play();
    }

    return () => {
      video.removeEventListener('canplay', play);
    };
  }, [reduced]);

  return (
    <div className={styles.frame}>
      {reduced ? (
        <Image
          src={posterSrc}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 42vw, 100vw"
          className={styles.poster}
        />
      ) : (
        <video
          ref={videoRef}
          className={styles.video}
          src={videoSrc}
          poster={posterSrc}
          muted
          playsInline
          loop
          autoPlay
          preload="metadata"
          aria-label={alt}
        />
      )}
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.logoBadge} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BRAND_LOGO.onLightBg} alt="" className={styles.logo} />
      </div>
    </div>
  );
}
