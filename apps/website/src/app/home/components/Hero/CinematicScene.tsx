'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { HERO_POSTER, HERO_VIDEO, HERO_VIDEO_START_SEC } from './constants';
import styles from './CinematicScene.module.css';

interface CinematicSceneProps {
  className?: string;
}

/** Below this width the hero stays on the poster — the video is ~18 MB. */
const VIDEO_MIN_WIDTH_QUERY = '(min-width: 768px)';

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

function canLoadHeroVideo(): boolean {
  if (!window.matchMedia(VIDEO_MIN_WIDTH_QUERY).matches) return false;
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && /(^|-)(slow-2g|2g|3g)$/.test(connection.effectiveType)) {
    return false;
  }
  return true;
}

function whenIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout: 2500 });
    return () => {
      window.cancelIdleCallback(id);
    };
  }
  const id = window.setTimeout(callback, 1200);
  return () => {
    window.clearTimeout(id);
  };
}

export function CinematicScene({ className }: CinematicSceneProps) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (reduced || !canLoadHeroVideo()) return;

    const startAfterLoad = () =>
      whenIdle(() => {
        setVideoEnabled(true);
      });
    if (document.readyState === 'complete') return startAfterLoad();

    let cancelIdle: (() => void) | undefined;
    const onLoad = () => {
      cancelIdle = startAfterLoad();
    };
    window.addEventListener('load', onLoad, { once: true });
    return () => {
      window.removeEventListener('load', onLoad);
      cancelIdle?.();
    };
  }, [reduced]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoEnabled) return;

    const seekAndPlay = () => {
      if (video.currentTime < HERO_VIDEO_START_SEC - 0.05) {
        video.currentTime = HERO_VIDEO_START_SEC;
      }
      void video.play().catch(() => {});
    };

    const onPlaying = () => {
      setVideoReady(true);
    };

    const loopFromStart = () => {
      video.currentTime = HERO_VIDEO_START_SEC;
      void video.play().catch(() => {});
    };

    video.addEventListener('loadedmetadata', seekAndPlay);
    video.addEventListener('canplay', seekAndPlay);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('ended', loopFromStart);

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      seekAndPlay();
    }

    return () => {
      video.removeEventListener('loadedmetadata', seekAndPlay);
      video.removeEventListener('canplay', seekAndPlay);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('ended', loopFromStart);
    };
  }, [videoEnabled]);

  return (
    <div className={[styles.scene, className].filter(Boolean).join(' ')} aria-hidden="true">
      <div className={styles.videoLayer}>
        <Image
          src={HERO_POSTER}
          alt=""
          fill
          priority
          fetchPriority="high"
          quality={75}
          sizes="100vw"
          className={styles.poster}
        />
        {videoEnabled && !reduced ? (
          <video
            ref={videoRef}
            className={[styles.video, videoReady && styles.videoReady].filter(Boolean).join(' ')}
            src={HERO_VIDEO}
            muted
            playsInline
            autoPlay
            preload="metadata"
            disablePictureInPicture
          />
        ) : null}
        <div className={styles.bgOverlay} />
      </div>
      <div className={styles.leftVignette} />
      <div className={styles.bottomFade} />
    </div>
  );
}
