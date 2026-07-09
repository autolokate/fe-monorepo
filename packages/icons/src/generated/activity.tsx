import { IconSvg } from '../IconSvg';
import type { IconProps } from '../types';

export function ActivityIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path
        d="M22 12h-4l-3 9L9 3l-3 9H2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconSvg>
  );
}
