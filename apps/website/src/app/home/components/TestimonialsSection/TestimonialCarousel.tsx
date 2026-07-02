"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TESTIMONIALS } from "./constants";
import { TestimonialCard } from "./TestimonialCard";
import styles from "./index.module.css";

export function TestimonialCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const count = TESTIMONIALS.length;

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

  // Keep the active dot in sync with whichever card is nearest the track start.
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
    <div className={`${styles.carousel} mt-10 sm:mt-12`}>
      <ul
        ref={trackRef}
        className={`${styles.track} flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-4 pt-3`}
      >
        {TESTIMONIALS.map((testimonial) => (
          <li
            key={testimonial.id}
            className="min-w-0 shrink-0 basis-[78%] snap-start min-[480px]:basis-[52%] sm:basis-[40%] lg:basis-[28%]"
          >
            <TestimonialCard testimonial={testimonial} />
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-center gap-2">
        {TESTIMONIALS.map((testimonial, index) => (
          <button
            key={testimonial.id}
            type="button"
            onClick={() => scrollToIndex(index)}
            className={`${styles.dot} ${index === active ? styles.dotActive : ""}`}
            aria-label={`Show testimonial from ${testimonial.name}`}
            aria-current={index === active}
          />
        ))}
      </div>
    </div>
  );
}
