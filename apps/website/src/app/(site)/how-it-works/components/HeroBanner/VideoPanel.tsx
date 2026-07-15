'use client';

import Image from 'next/image';
import { Maximize2, Pause, Play, Settings, ShieldCheck, Volume2 } from 'lucide-react';
import type { HeroVideo } from './constants';
import styles from './index.module.css';

interface VideoPanelProps {
  video: HeroVideo;
  playing: boolean;
  onPlay: () => void;
}

export function VideoPanel({ video, playing, onPlay }: VideoPanelProps) {
  return (
    <figure className={styles.videoFigure}>
      <div className={styles.videoCard}>
        <div className={styles.videoStage}>
          {playing ? (
            <iframe
              src={video.embedUrl}
              title={video.caption}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className={styles.videoFrame}
            />
          ) : (
            <>
              <Image
                src={video.poster}
                alt={video.posterAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 52vw"
                className={styles.videoPoster}
                unoptimized
              />
              <span className={styles.videoScrim} aria-hidden />

              <ol className={styles.stepper} aria-hidden>
                {video.steps.map(({ Icon, label }) => (
                  <li key={label} className={styles.step}>
                    <span className={styles.stepIcon}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className={styles.stepLabel}>{label}</span>
                  </li>
                ))}
              </ol>

              <button
                type="button"
                className={styles.playButton}
                onClick={onPlay}
                aria-label="Play video"
              >
                <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden />
              </button>
            </>
          )}
        </div>

        <div className={styles.controls} aria-hidden={!playing ? 'true' : undefined}>
          <button
            type="button"
            className={styles.controlPlay}
            onClick={onPlay}
            aria-label={playing ? 'Pause video' : 'Play video'}
          >
            {playing ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            )}
          </button>

          <span className={styles.time}>0:00 / {video.duration}</span>

          <span className={styles.scrubber}>
            <span
              className={styles.scrubberFill}
              style={{ width: `${Math.round(video.progress * 100)}%` }}
            />
          </span>

          <span className={styles.controlIcons}>
            <Volume2 className="h-4 w-4" aria-hidden />
            <Settings className="h-4 w-4" aria-hidden />
            <Maximize2 className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>

      <figcaption className={styles.caption}>
        <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
        {video.caption}
      </figcaption>
    </figure>
  );
}
