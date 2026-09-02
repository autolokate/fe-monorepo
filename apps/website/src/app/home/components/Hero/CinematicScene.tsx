'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { HERO_POSTER, HERO_VIDEO, HERO_VIDEO_START_SEC } from './constants';
import styles from './CinematicScene.module.css';

interface CinematicSceneProps {
  className?: string;
}

export function CinematicScene({ className }: CinematicSceneProps) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return;

    const seekAndPlay = () => {
      if (video.currentTime < HERO_VIDEO_START_SEC - 0.05) {
        video.currentTime = HERO_VIDEO_START_SEC;
      }
      void video.play().catch(() => {});
    };

    const loopFromStart = () => {
      video.currentTime = HERO_VIDEO_START_SEC;
      void video.play().catch(() => {});
    };

    video.addEventListener('loadedmetadata', seekAndPlay);
    video.addEventListener('canplay', seekAndPlay);
    video.addEventListener('ended', loopFromStart);

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      seekAndPlay();
    }

    return () => {
      video.removeEventListener('loadedmetadata', seekAndPlay);
      video.removeEventListener('canplay', seekAndPlay);
      video.removeEventListener('ended', loopFromStart);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <div className={[styles.scene, className].filter(Boolean).join(' ')} aria-hidden="true">
        <div className={styles.videoLayer}>
          <Image
            src={HERO_POSTER}
            alt=""
            fill
            priority
            quality={90}
            sizes="100vw"
            className={styles.poster}
          />
          <div className={styles.bgOverlay} />
        </div>
        <div className={styles.leftVignette} />
        <div className={styles.bottomFade} />
      </div>
    );
  }

  return (
    <div className={[styles.scene, className].filter(Boolean).join(' ')} aria-hidden="true">
      <div className={styles.videoLayer}>
        <video
          ref={videoRef}
          className={styles.video}
          src={HERO_VIDEO}
          muted
          playsInline
          autoPlay
          preload="auto"
        />
        <div className={styles.bgOverlay} />
      </div>
      <div className={styles.leftVignette} />
      <div className={styles.bottomFade} />
    </div>
  );
}
