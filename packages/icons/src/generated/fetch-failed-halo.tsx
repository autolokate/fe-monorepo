import type { IconProps } from '../types';

/** Figma R04b halo — node 579:1667, 240×240 amber blur + circle-x. */
export function FetchFailedHaloIcon({
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
      <g filter="url(#filter0_f_fetch_failed_halo)">
        <circle cx="120" cy="120" r="60" fill="var(--al-signal-amber)" fillOpacity="0.3" />
      </g>
      <circle cx="120" cy="120" r="74" stroke="var(--al-color-warning)" strokeWidth="2" />
      <path
        d="M120 140.833C131.506 140.833 140.833 131.506 140.833 120C140.833 108.494 131.506 99.1666 120 99.1666C108.494 99.1666 99.1667 108.494 99.1667 120C99.1667 131.506 108.494 140.833 120 140.833Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M126.25 113.75L113.75 126.25"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M113.75 113.75L126.25 126.25"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <filter
          id="filter0_f_fetch_failed_halo"
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
