"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Quote } from "lucide-react";
import { SAVE_STORIES } from "./constants";
import styles from "./index.module.css";

export function StoriesCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const count = SAVE_STORIES.length;

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(index, count - 1));
      const card = track.children[clamped] as HTMLElement | undefined;
      if (card) {
        track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
      }
    },
    [count],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const children = Array.from(track.children) as HTMLElement[];
        const start = track.scrollLeft;
        let nearest = 0;
        let min = Infinity;
        children.forEach((child, index) => {
          const distance = Math.abs(child.offsetLeft - track.offsetLeft - start);
          if (distance < min) {
            min = distance;
            nearest = index;
          }
        });
        setActive(nearest);
      });
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.carousel}>
      <ul ref={trackRef} className={styles.track}>
        {SAVE_STORIES.map((story) => (
          <li key={story.id} className={styles.slide}>
            <article className={styles.card}>
              <span className={styles.quoteMark} aria-hidden>
                <Quote className="h-6 w-6 fill-current" />
              </span>

              <blockquote className={styles.quote}>{story.quote}</blockquote>

              <div className={styles.cardFooter}>
                <div className={styles.author}>
                  <p className={styles.name}>– {story.name}</p>
                  <p className={styles.role}>{story.role}</p>
                </div>
                <CheckCircle2 className={styles.verified} aria-hidden />
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className={styles.dots}>
        {SAVE_STORIES.map((story, index) => (
          <button
            key={story.id}
            type="button"
            onClick={() => scrollToIndex(index)}
            className={`${styles.dot} ${index === active ? styles.dotActive : ""}`}
            aria-label={`Show story from ${story.name}`}
            aria-current={index === active}
          />
        ))}
      </div>
    </div>
  );
}
