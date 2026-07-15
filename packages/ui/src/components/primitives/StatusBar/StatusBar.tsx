import { cn } from '../../../utils/cn';

import type { StatusBarProps } from './StatusBar.types';
import './StatusBar.css';

function DefaultStatusIcons() {
  return (
    <>
      <span className="al-status-bar__glyph" aria-hidden>
        <span className="al-status-bar__glyph-bar" />
        <span className="al-status-bar__glyph-bar" />
        <span className="al-status-bar__glyph-bar" />
        <span className="al-status-bar__glyph-bar" />
      </span>
      <span className="al-status-bar__wifi" aria-hidden />
      <span className="al-status-bar__battery" aria-hidden />
    </>
  );
}

export function StatusBar({ time, icons, className, ...props }: StatusBarProps) {
  return (
    <div
      className={cn('al-status-bar', className)}
      role="status"
      aria-label="Device status bar"
      {...props}
    >
      <time className="al-status-bar__time" dateTime={time}>
        {time}
      </time>
      <div className="al-status-bar__icons" aria-hidden>
        {icons ?? <DefaultStatusIcons />}
      </div>
    </div>
  );
}

export const AlStatusBar = StatusBar;
