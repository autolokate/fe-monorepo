'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MEDIA_ARTICLES, getFeaturedMediaArticle } from '../../data/articles';
import {
  MEDIA_VIDEOS,
  MEDIA_VIDEO_CATEGORIES,
  getFeaturedMediaVideo,
  type MediaVideo,
  type MediaVideoCategory,
} from '../../data/videos';
import { ArticlesPanel } from '../ArticlesPanel';
import { VideosPanel } from '../VideosPanel';
import { VideoPlayerModal } from '../VideoPlayerModal';
import styles from './index.module.css';

export type MediaTab = 'articles' | 'videos';

const TAB_PARAM = 'tab';

function resolveTab(value: string | null): MediaTab {
  return value === 'videos' ? 'videos' : 'articles';
}

export function MediaHub() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTab = resolveTab(searchParams.get(TAB_PARAM));
  const [activeTab, setActiveTab] = useState<MediaTab>(urlTab);

  const featuredArticle = useMemo(() => getFeaturedMediaArticle(), []);
  const articles = useMemo(
    () => MEDIA_ARTICLES.filter((a) => a.slug !== featuredArticle.slug),
    [featuredArticle.slug],
  );

  const featuredVideo = useMemo(() => getFeaturedMediaVideo(), []);
  const videos = useMemo(
    () => MEDIA_VIDEOS.filter((v) => v.id !== featuredVideo.id),
    [featuredVideo.id],
  );

  const [videoCategory, setVideoCategory] = useState<MediaVideoCategory | 'All'>('All');
  const [activeVideo, setActiveVideo] = useState<MediaVideo | null>(null);

  const filteredVideos = useMemo(() => {
    if (videoCategory === 'All') return videos;
    return videos.filter((v) => v.category === videoCategory);
  }, [videos, videoCategory]);

  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  const setTab = useCallback(
    (tab: MediaTab) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'articles') params.delete(TAB_PARAM);
      else params.set(TAB_PARAM, tab);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (activeTab !== 'videos') setActiveVideo(null);
  }, [activeTab]);

  return (
    <div className={styles.hub}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            Stories &amp; film
          </p>
          <h1 className={styles.title}>Media</h1>
          <p className={styles.subtitle}>
            Stories, insights and videos shaping the future of safer, smarter mobility.
          </p>

          <div className={styles.tabs} role="tablist" aria-label="Media sections">
            <button
              type="button"
              role="tab"
              id="media-tab-articles"
              aria-selected={activeTab === 'articles'}
              aria-controls="media-panel-articles"
              className={activeTab === 'articles' ? styles.tabActive : styles.tab}
              onClick={() => {
                setTab('articles');
              }}
            >
              Articles
            </button>
            <button
              type="button"
              role="tab"
              id="media-tab-videos"
              aria-selected={activeTab === 'videos'}
              aria-controls="media-panel-videos"
              className={activeTab === 'videos' ? styles.tabActive : styles.tab}
              onClick={() => {
                setTab('videos');
              }}
            >
              Videos
            </button>
          </div>
        </div>
      </header>

      <div
        id="media-panel-articles"
        role="tabpanel"
        aria-labelledby="media-tab-articles"
        hidden={activeTab !== 'articles'}
        className={styles.panel}
      >
        {activeTab === 'articles' ? (
          <ArticlesPanel featured={featuredArticle} articles={articles} />
        ) : null}
      </div>

      <div
        id="media-panel-videos"
        role="tabpanel"
        aria-labelledby="media-tab-videos"
        hidden={activeTab !== 'videos'}
        className={styles.panel}
      >
        {activeTab === 'videos' ? (
          <VideosPanel
            featured={featuredVideo}
            videos={filteredVideos}
            categories={MEDIA_VIDEO_CATEGORIES}
            activeCategory={videoCategory}
            onCategoryChange={setVideoCategory}
            onPlay={setActiveVideo}
          />
        ) : null}
      </div>

      <VideoPlayerModal
        video={activeVideo}
        onClose={() => {
          setActiveVideo(null);
        }}
      />
    </div>
  );
}
