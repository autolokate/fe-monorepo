import { cn } from '../../../utils/cn';

import './CircleCheckIconGlyph.css';

export type CircleCheckIconGlyphProps = {
  size?: number;
  className?: string;
};

/** Figma icon/circle-check · 181:28 — CC tracker complete steps. */
export function CircleCheckIconGlyph({ size = 18, className }: CircleCheckIconGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn('al-circle-check-glyph', className)}
    >
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12L11 14L15 10"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
