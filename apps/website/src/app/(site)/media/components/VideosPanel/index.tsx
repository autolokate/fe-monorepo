'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { youtubeThumbnailUrl } from '@/lib/idg';
import { IDG_CHANNEL_URL, type MediaVideo, type MediaVideoCategory } from '../../data/videos';
import { MediaBrandMark } from '../MediaBrandMark';
import styles from './index.module.css';

const PAGE_SIZE = 12;

interface VideosPanelProps {
  featured: MediaVideo;
  videos: MediaVideo[];
  categories: MediaVideoCategory[];
  activeCategory: MediaVideoCategory | 'All';
  onCategoryChange: (category: MediaVideoCategory | 'All') => void;
  onPlay: (video: MediaVideo) => void;
}

export function VideosPanel({
  featured,
  videos,
  categories,
  activeCategory,
  onCategoryChange,
  onPlay,
}: VideosPanelProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [activeCategory]);

  const shown = videos.slice(0, visible);
  const hasMore = visible < videos.length;

  return (
    <div className={styles.wrap}>
      <section className={styles.featured} aria-labelledby="media-featured-video">
        <button
          type="button"
          className={styles.featuredBtn}
          onClick={() => {
            onPlay(featured);
          }}
          aria-label={`Play featured video: ${featured.title}`}
        >
          <div className={styles.featuredMedia}>
            <Image
              src={youtubeThumbnailUrl(featured.id, 'hqdefault')}
              alt=""
              fill
              priority
              sizes="(max-width: 900px) 100vw, 70vw"
              className={styles.featuredImage}
            />
            <span className={styles.playOverlay} aria-hidden="true">
              <span className={styles.playDisc}>
                <Play className={styles.playIcon} fill="currentColor" />
              </span>
            </span>
            <span className={styles.featuredBadge}>Featured</span>
            <MediaBrandMark size="lg" corner="bottom-left" />
            <span className={styles.duration}>{featured.duration}</span>
          </div>
          <div className={styles.featuredCopy}>
            <p className={styles.meta}>
              <span className={styles.category}>{featured.category}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={featured.date}>{featured.dateLabel}</time>
            </p>
            <h2 id="media-featured-video" className={styles.featuredTitle}>
              {featured.title}
            </h2>
            <p className={styles.featuredDesc}>{featured.description}</p>
          </div>
        </button>
      </section>

      <div className={styles.toolbar}>
        <div className={styles.toolbarHead}>
          <h2 className={styles.sectionTitle}>Explore videos</h2>
          <p className={styles.sourceNote}>
            Curated from{' '}
            <a href={IDG_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
              Indian Drive Guide
            </a>
          </p>
        </div>
        <div className={styles.filters} role="group" aria-label="Filter videos by category">
          <button
            type="button"
            className={activeCategory === 'All' ? styles.chipActive : styles.chip}
            onClick={() => {
              onCategoryChange('All');
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={activeCategory === cat ? styles.chipActive : styles.chip}
              onClick={() => {
                onCategoryChange(cat);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <ul className={styles.grid}>
        {shown.map((video) => (
          <li key={video.id}>
            <VideoCard video={video} onPlay={onPlay} />
          </li>
        ))}
      </ul>

      {videos.length === 0 ? <p className={styles.empty}>No videos in this category yet.</p> : null}

      {hasMore ? (
        <div className={styles.moreRow}>
          <button
            type="button"
            className={styles.moreBtn}
            onClick={() => {
              setVisible((n) => n + PAGE_SIZE);
            }}
          >
            Load more videos
          </button>
        </div>
      ) : null}
    </div>
  );
}

function VideoCard({ video, onPlay }: { video: MediaVideo; onPlay: (video: MediaVideo) => void }) {
  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => {
        onPlay(video);
      }}
      aria-label={`Play video: ${video.title}`}
    >
      <div className={styles.cardMedia}>
        <Image
          src={youtubeThumbnailUrl(video.id, 'hqdefault')}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.cardImage}
        />
        <span className={styles.cardPlay} aria-hidden="true">
          <Play className={styles.cardPlayIcon} fill="currentColor" />
        </span>
        <MediaBrandMark size="sm" corner="bottom-left" />
        <span className={styles.duration}>{video.duration}</span>
        {video.popular ? <span className={styles.popularBadge}>Popular</span> : null}
      </div>
      <div className={styles.cardBody}>
        <p className={styles.meta}>
          <span className={styles.category}>{video.category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={video.date}>{video.dateLabel}</time>
        </p>
        <h3 className={styles.cardTitle}>{video.title}</h3>
        <p className={styles.cardDesc}>{video.description}</p>
      </div>
    </button>
  );
}
