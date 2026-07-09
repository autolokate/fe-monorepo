import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setThemeMode } from '@autolokate/design-system';

import { App } from '@/app/App';
import { validateEnv } from '@/config/env';
import { applyEffectiveTheme } from '@/platform/theme/theme-preference';

import '@/styles/globals.css';

const initialTheme = applyEffectiveTheme();
setThemeMode(initialTheme);

validateEnv();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
