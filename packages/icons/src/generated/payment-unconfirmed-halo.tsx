import type { IconProps } from '../types';

/** Figma R10c halo — node 579:1642, 240×240 amber blur + credit card. */
export function PaymentUnconfirmedHaloIcon({
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
      <g filter="url(#filter0_f_payment_unconfirmed_halo)">
        <circle cx="120" cy="120" r="60" fill="var(--al-signal-amber)" fillOpacity="0.3" />
      </g>
      <circle cx="120" cy="120" r="74" stroke="var(--al-color-warning)" strokeWidth="2" />
      <path
        d="M136.667 105.417H103.334C101.032 105.417 99.167 107.282 99.167 109.583V130.417C99.167 132.718 101.032 134.583 103.334 134.583H136.667C138.968 134.583 140.834 132.718 140.834 130.417V109.583C140.834 107.282 138.968 105.417 136.667 105.417Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M99.167 115.833H140.834"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <filter
          id="filter0_f_payment_unconfirmed_halo"
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
