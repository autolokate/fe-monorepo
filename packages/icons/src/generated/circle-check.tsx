import { IconSvg } from '../IconSvg';
import type { IconProps } from '../types';

/** Figma 181:28 — 2px stroke #1FA24A; non-scaling stroke preserves weight at 14px verified chip. */
export function CircleCheckIcon(props: IconProps) {
  return (
    <IconSvg {...props} strokeWidth={2}>
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth={2}
        vectorEffect="nonScalingStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="currentColor"
        strokeWidth={2}
        vectorEffect="nonScalingStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconSvg>
  );
}
