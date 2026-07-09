import '@autolokate/design-system/theme.css';
import './styles/interaction-motion.css';
import './styles/screen-viewport.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { setThemeMode } from '@autolokate/design-system';

import { validateEnv } from './config/env';
import { AppStartupErrorBoundary } from './platform/AppStartupErrorBoundary';
import { applyEffectiveTheme } from './platform/theme/theme-preference';
import { ScreenDevApp } from './dev/ScreenDevApp';
import { JourneyOrchestrator } from './journey/index';

const initialTheme = applyEffectiveTheme();
setThemeMode(initialTheme);

validateEnv();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const isDevPreview = new URLSearchParams(window.location.search).get('dev') === '1';

createRoot(rootElement).render(
  <StrictMode>
    <AppStartupErrorBoundary>
      {isDevPreview ? (
        <BrowserRouter>
          <ScreenDevApp />
        </BrowserRouter>
      ) : (
        <JourneyOrchestrator />
      )}
    </AppStartupErrorBoundary>
  </StrictMode>,
);
