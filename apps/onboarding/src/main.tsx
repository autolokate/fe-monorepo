import '@autolokate/design-system/theme.css';
import './styles/interaction-motion.css';
import './styles/screen-viewport.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { setThemeMode } from '@autolokate/design-system';

import { validateEnv } from './config/env.js';
import { ScreenDevApp } from './dev/ScreenDevApp.js';
import { JourneyOrchestrator } from './journey/index.js';
import { THEME_KEY } from './journey/constants.js';

function getInitialTheme(): 'light' | 'dark' {
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const theme = getInitialTheme();
setThemeMode(theme);
document.documentElement.setAttribute('data-theme', theme);

validateEnv();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const isDevPreview = new URLSearchParams(window.location.search).get('dev') === '1';

createRoot(rootElement).render(
  <StrictMode>
    {isDevPreview ? (
      <BrowserRouter>
        <ScreenDevApp />
      </BrowserRouter>
    ) : (
      <JourneyOrchestrator />
    )}
  </StrictMode>,
);
