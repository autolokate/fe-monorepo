import { MapPin, Star } from "lucide-react";
import type { Testimonial } from "./types";
import styles from "./index.module.css";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const MAX_STARS = 5;

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const { name, role, initials, rating, quote, location } = testimonial;

  return (
    <article className={`${styles.card} flex h-full flex-col rounded-2xl p-5 sm:p-6`}>
      <div className="flex items-center gap-3.5">
        <span className={styles.avatar} aria-hidden>
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold leading-snug text-foreground">{name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{role}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1" aria-label={`${rating} out of ${MAX_STARS} stars`}>
        {Array.from({ length: MAX_STARS }).map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${index < rating ? styles.starActive : styles.starMuted}`}
            aria-hidden
          />
        ))}
      </div>

      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{quote}&rdquo;
      </blockquote>

      <div className="mt-5 flex items-center gap-2 border-t border-border/60 pt-4 text-sm text-muted-foreground">
        <MapPin className={`${styles.accent} h-4 w-4 shrink-0`} strokeWidth={1.9} aria-hidden />
        <span className="truncate">{location}</span>
      </div>
    </article>
  );
}
