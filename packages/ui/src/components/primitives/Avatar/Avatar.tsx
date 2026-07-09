import { cn } from '../../../utils/cn';

import type { AlAvatarProps } from './Avatar.types';
import './Avatar.css';

export function AlAvatar({
  src,
  alt,
  initials,
  icon,
  size = 'md',
  className,
  children,
  ...props
}: AlAvatarProps) {
  return (
    <div className={cn('al-avatar', `al-avatar--${size}`, className)} {...props}>
      {src ? (
        <img src={src} alt={alt ?? 'Avatar'} className="al-avatar__image" />
      ) : icon ? (
        <span className="al-avatar__icon" aria-hidden>
          {icon}
        </span>
      ) : (
        <span className="al-avatar__initials">{children ?? initials ?? 'AL'}</span>
      )}
    </div>
  );
}
