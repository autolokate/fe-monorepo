import { IconSvg } from '../IconSvg';
import type { IconProps } from '../types';

export function CameraIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path
        d="M4 7h3l2-2h6l2 2h3v12H4V7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx={12} cy={13} r={3.5} stroke="currentColor" strokeWidth="2" />
    </IconSvg>
  );
}
