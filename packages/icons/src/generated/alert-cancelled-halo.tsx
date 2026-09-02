import type { IconProps } from '../types';

/** Figma 876:2212 — alert cancelled neutral halo + check. */
export function AlertCancelledHaloIcon({
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
      <g filter="url(#filter0_f_alert_cancelled_halo)">
        <circle cx="120" cy="120" r="60" fill="var(--al-neutral-500)" fillOpacity="0.3" />
      </g>
      <circle cx="120" cy="120" r="74" stroke="var(--al-color-on-surface-muted)" strokeWidth="2" />
      <path
        d="M120 140.833C131.506 140.833 140.834 131.506 140.834 120C140.834 108.494 131.506 99.1665 120 99.1665C108.494 99.1665 99.167 108.494 99.167 120C99.167 131.506 108.494 140.833 120 140.833Z"
        stroke="var(--al-color-on-surface)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M113.75 120L117.917 124.167L126.25 115.833"
        stroke="var(--al-color-on-surface)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <filter
          id="filter0_f_alert_cancelled_halo"
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
