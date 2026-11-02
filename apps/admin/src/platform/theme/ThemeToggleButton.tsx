import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/providers/ThemeProvider';

export function ThemeToggleButton() {
  const { themeMode, toggleTheme } = useTheme();
  const isDark = themeMode === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      className="ax-icon-btn"
      aria-label={label}
      title={label}
      onClick={toggleTheme}
    >
      {isDark ? <Sun size={17} aria-hidden /> : <Moon size={17} aria-hidden />}
    </button>
  );
}
