import type { IconProps } from '../types';

/** Figma 875:2193 — location unavailable amber halo + map pin. */
export function LocationUnavailableHaloIcon({
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
      <g filter="url(#filter0_f_location_unavailable_halo)">
        <circle cx="120" cy="120" r="60" fill="var(--al-signal-amber)" fillOpacity="0.3" />
      </g>
      <circle cx="120" cy="120" r="74" stroke="var(--al-color-warning)" strokeWidth="2" />
      <path
        d="M121.252 140.414C125.127 137.069 136.666 126.235 136.666 115.833C136.666 111.413 134.91 107.174 131.785 104.048C128.659 100.922 124.42 99.1665 120 99.1665C115.579 99.1665 111.34 100.922 108.215 104.048C105.089 107.174 103.333 111.413 103.333 115.833C103.333 126.235 114.873 137.069 118.748 140.414C119.109 140.686 119.548 140.833 120 140.833C120.451 140.833 120.891 140.686 121.252 140.414Z"
        stroke="var(--al-color-on-surface)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M120 122.083C123.452 122.083 126.25 119.285 126.25 115.833C126.25 112.382 123.452 109.583 120 109.583C116.548 109.583 113.75 112.382 113.75 115.833C113.75 119.285 116.548 122.083 120 122.083Z"
        stroke="var(--al-color-on-surface)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <filter
          id="filter0_f_location_unavailable_halo"
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
