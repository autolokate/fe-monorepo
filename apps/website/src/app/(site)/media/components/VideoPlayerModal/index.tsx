'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { youtubeNocookieEmbedSrc } from '@/lib/idg';
import { IDG_CHANNEL_URL, type MediaVideo } from '../../data/videos';
import styles from './index.module.css';

interface VideoPlayerModalProps {
  video: MediaVideo | null;
  onClose: () => void;
}

export function VideoPlayerModal({ video, onClose }: VideoPlayerModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!video) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [video, onClose]);

  if (!video) return null;

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={styles.topBar}>
          <div className={styles.topMeta}>
            {/* eslint-disable-next-line @next/next/no-img-element -- brand mark */}
            <img
              src="/brand/al-logo-dark.svg"
              alt=""
              className={styles.brandMark}
              draggable={false}
              aria-hidden="true"
            />
            <span className={styles.category}>{video.category}</span>
            <span className={styles.duration}>{video.duration}</span>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close video"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.player}>
          <iframe
            title={video.title}
            src={youtubeNocookieEmbedSrc(video.id, { autoplay: true, controls: 1, mute: false })}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className={styles.iframe}
          />
        </div>

        <div className={styles.copy}>
          <h2 id={titleId} className={styles.title}>
            {video.title}
          </h2>
          <p className={styles.description}>{video.description}</p>
          <p className={styles.credit}>
            From{' '}
            <a href={IDG_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
              Indian Drive Guide
            </a>
            <span aria-hidden="true"> · </span>
            <time dateTime={video.date}>{video.dateLabel}</time>
          </p>
        </div>
      </div>
    </div>
  );
}
