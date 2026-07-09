import { iconComponentMap } from './generated/map';
import type { AlIconProps } from './iconNames';

export type { AlIconName, AlIconProps, AlIconSize } from './iconNames';

export function AlIcon({ name, size = 24, className, 'aria-label': ariaLabel }: AlIconProps) {
  const IconComponent = iconComponentMap[name];
  return (
    <IconComponent
      size={size}
      {...(className !== undefined ? { className } : {})}
      {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}
    />
  );
}
