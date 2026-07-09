import { IconSvg } from '../IconSvg';
import type { IconProps } from '../types';

export function ArrowLeftIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </IconSvg>
  );
}
