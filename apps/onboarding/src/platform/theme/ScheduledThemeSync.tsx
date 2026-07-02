import { setThemeMode } from '@autolokate/design-system';
import { useEffect } from 'react';

import { applyScheduledTheme, msUntilNextThemeChange } from './resolve-scheduled-theme.js';

/** Keeps document theme aligned with local time-of-day without persisting preference. */
export function ScheduledThemeSync() {
  useEffect(() => {
    const sync = () => {
      const theme = applyScheduledTheme();
      setThemeMode(theme);
    };

    sync();

    let timerId = 0;
    const schedule = () => {
      timerId = window.setTimeout(() => {
        sync();
        schedule();
      }, msUntilNextThemeChange());
    };

    schedule();

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  return null;
}
