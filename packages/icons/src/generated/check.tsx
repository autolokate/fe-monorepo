import type { IconProps } from '../types';

/** Figma R03 chip Vector — layout_Z3X5HC 10×7, viewBox 0 0 12 9, node 170:38. */
const CHECK_VIEWBOX_WIDTH = 12;
const CHECK_VIEWBOX_HEIGHT = 9;
const CHECK_ASPECT = CHECK_VIEWBOX_HEIGHT / CHECK_VIEWBOX_WIDTH;

export function CheckIcon({
  size = 10,
  className,
  strokeWidth = 2,
  'aria-label': ariaLabel,
  ...props
}: IconProps) {
  const width = typeof size === 'number' || typeof size === 'string' ? size : 10;
  const numericWidth = typeof width === 'number' ? width : 10;
  const height =
    typeof size === 'number'
      ? Number((size * CHECK_ASPECT).toFixed(4))
      : Number((numericWidth * CHECK_ASPECT).toFixed(4));

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      role={ariaLabel ? 'img' : undefined}
      {...props}
    >
      <path
        d="M1 4.5L4.5 8L11 1"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
