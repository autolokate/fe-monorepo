import type { IconProps } from '../types';

/** Figma 875:2219 — couldn't send alert halo + triangle. */
export function CouldntSendHaloIcon({
  size = 240,
  className,
  'aria-label': ariaLabel,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      role={ariaLabel ? 'img' : undefined}
      {...props}
    >
      <g filter="url(#filter0_f_couldnt_send_halo)">
        <circle cx="120" cy="120" r="60" fill="var(--al-signal-amber)" fillOpacity="0.3" />
      </g>
      <circle cx="120" cy="120" r="74" stroke="var(--al-color-warning)" strokeWidth="2" />
      <path
        d="M140.271 132.5L123.604 103.333C123.24 102.692 122.713 102.159 122.077 101.788C121.44 101.417 120.716 101.221 119.979 101.221C119.242 101.221 118.518 101.417 117.881 101.788C117.244 102.159 116.717 102.692 116.354 103.333L99.6872 132.5C99.3199 133.136 99.1273 133.858 99.1289 134.593C99.1305 135.327 99.3264 136.049 99.6965 136.683C100.067 137.318 100.598 137.843 101.237 138.206C101.875 138.569 102.598 138.757 103.333 138.75H136.666C137.397 138.749 138.115 138.556 138.748 138.19C139.381 137.824 139.906 137.298 140.272 136.665C140.637 136.032 140.829 135.313 140.829 134.582C140.829 133.851 140.636 133.133 140.271 132.5Z"
        stroke="var(--al-color-on-surface)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M120 113.75V122.083"
        stroke="var(--al-color-on-surface)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M120 130.417H120.021"
        stroke="var(--al-color-on-surface)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <filter
          id="filter0_f_couldnt_send_halo"
          x="20"
          y="20"
          width="200"
          height="200"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="20" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}
