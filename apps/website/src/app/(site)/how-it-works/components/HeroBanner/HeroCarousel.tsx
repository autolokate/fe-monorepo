"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AlButton } from "@autolokate/ui/button";
import { HERO_PRIMARY_CTA, HERO_SLIDES } from "./constants";
import { VideoPanel } from "./VideoPanel";
import styles from "./index.module.css";

const AUTO_ROTATE_MS = 5000;

export function HeroCarousel() {
  const router = useRouter();
  const slides = HERO_SLIDES;
  const count = slides.length;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);

  const select = (index: number) => {
    setPlaying(false);
    setActive(index);
  };

  // Auto-advance every 5s unless paused, a video is playing, or reduced-motion.
  useEffect(() => {
    if (paused || playing || count <= 1) return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % count);
    }, AUTO_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, playing, count]);

  const slide = slides[active];

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div key={slide.id} className={styles.slide}>
        <div className={styles.copy}>
          <div className={styles.copyText}>
            <span className={styles.badge}>{slide.badge}</span>

            <h1 className={styles.headline}>
              {slide.headline}
              <br />
              <span className={styles.headlineAccent}>{slide.headlineAccent}</span>
            </h1>

            <p className={styles.description}>{slide.description}</p>
          </div>

          <div className={styles.ctas}>
            <AlButton
              size="md"
              variant="primary"
              className={styles.ctaPrimary}
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="end"
              onClick={() => router.push(HERO_PRIMARY_CTA.href)}
            >
              {HERO_PRIMARY_CTA.label}
            </AlButton>
          </div>
        </div>

        <div className={styles.media}>
          <VideoPanel
            video={slide.video}
            playing={playing}
            onPlay={() => setPlaying((prev) => !prev)}
          />
        </div>
      </div>

      <div className={styles.dots}>
        {slides.map((s, index) => (
          <button
            key={s.id}
            type="button"
            onClick={() => select(index)}
            className={`${styles.dot} ${index === active ? styles.dotActive : ""}`}
            aria-label={`Show slide ${index + 1}`}
            aria-current={index === active}
          />
        ))}
      </div>
    </div>
  );
}
