import type { IconProps } from '../types';

/** Figma R15 halo — node 171:62, 240×240 radial green + shield-check. */
export function ActivationCompleteHaloIcon({
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
      <circle
        cx="120"
        cy="120"
        r="120"
        className="al-activation-halo__ambient"
        fill="url(#paint0_radial_activation_halo)"
      />
      <circle cx="120" cy="120" r="75" stroke="var(--al-color-success)" strokeWidth="2" />
      <path
        d="M120 156.667C140.301 156.667 156.667 140.301 156.667 120C156.667 99.699 140.301 83.3333 120 83.3333C99.699 83.3333 83.3333 99.699 83.3333 120C83.3333 140.301 99.699 156.667 120 156.667Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M120 102.667V120"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M120 120L128.333 128.333"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M98.667 120H104.667C106.876 120 108.667 118.209 108.667 116V112.667C108.667 110.457 106.876 108.667 104.667 108.667H98.667C96.457 108.667 94.667 110.457 94.667 112.667V116C94.667 118.209 96.457 120 98.667 120Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M135.333 120H141.333C143.543 120 145.333 118.209 145.333 116V112.667C145.333 110.457 143.543 108.667 141.333 108.667H135.333C133.124 108.667 131.333 110.457 131.333 112.667V116C131.333 118.209 133.124 120 135.333 120Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <radialGradient
          id="paint0_radial_activation_halo"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(120 120) rotate(90) scale(120)"
        >
          <stop stopColor="#1FA24A" stopOpacity="0.28" />
          <stop offset="1" stopColor="#1FA24A" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
