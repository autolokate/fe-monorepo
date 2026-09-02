import { IconSvg } from '../IconSvg';
import type { IconProps } from '../types';

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconSvg>
  );
}
