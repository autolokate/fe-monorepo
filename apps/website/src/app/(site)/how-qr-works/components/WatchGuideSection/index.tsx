"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoutubeIcon } from "@/layouts/Footer/constants";
import {
  YT_EMBED_URL,
  YT_THUMBNAIL,
  YT_VIDEO_URL,
  WATCH_GUIDE_COPY,
  WATCH_GUIDE_TRUST_CHIPS,
} from "./constants";
import styles from "./index.module.css";

export function WatchGuideSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className={styles.section} aria-labelledby="watch-guide-heading">
      <div className={styles.container}>
        <div className={styles.panel}>
          <div className={styles.grid}>
            <div className={styles.copy}>
              <span className={styles.badge}>{WATCH_GUIDE_COPY.eyebrow}</span>
              <h2 id="watch-guide-heading" className={styles.headline}>
                {WATCH_GUIDE_COPY.headline}
              </h2>
              <p className={styles.description}>{WATCH_GUIDE_COPY.description}</p>
              <div className={styles.ctaWrap}>
                <Button size="lg" asChild>
                  <a href={YT_VIDEO_URL} target="_blank" rel="noopener noreferrer">
                    <YoutubeIcon className="h-4 w-4" aria-hidden />
                    {WATCH_GUIDE_COPY.youtubeLabel}
                  </a>
                </Button>
                <ul className={styles.chips}>
                  {WATCH_GUIDE_TRUST_CHIPS.map(({ label, Icon }) => (
                    <li key={label} className={styles.chip}>
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.media}>
              <div className={styles.mediaInner}>
                {playing ? (
                  <iframe
                    key="watch-guide-yt"
                    src={YT_EMBED_URL}
                    title={WATCH_GUIDE_COPY.iframeTitle}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className={styles.iframe}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    aria-label={WATCH_GUIDE_COPY.playLabel}
                    className={styles.playButton}
                  >
                    <Image
                      src={YT_THUMBNAIL}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className={styles.thumbnail}
                    />
                    <span className={styles.overlay} aria-hidden />
                    <span className={styles.playIcon} aria-hidden>
                      <Play className="ml-1 h-8 w-8 fill-current text-[#0a0a0a] sm:h-9 sm:w-9" />
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
