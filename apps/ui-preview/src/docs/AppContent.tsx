import type { CSSProperties } from 'react';
import {
  colorPrimitives,
  motion,
  radius,
  semanticLight,
  space,
  typography,
} from '@autolokate/design-system';
import { AlText } from '@autolokate/ui';

import { isCompositionPage, isCoreComponentPage } from './data.js';
import { TokenGrid } from './components/TokenGrid.js';
import { BrandPage } from './pages/BrandPage.js';
import { CoreComponentsPage } from './pages/core/CoreComponentsPage.js';
import { IconsPage } from './pages/IconsPage.js';
import { InstallationPage } from './pages/InstallationPage.js';
import { OverviewPage } from './pages/OverviewPage.js';
import { ScreenBackgroundsPage } from './pages/ScreenBackgroundsPage.js';
import { UsagePage } from './pages/UsagePage.js';
import { CompositionIndexPage } from './pages/compositions/CompositionIndexPage.js';
import { CompositionsPage } from './pages/compositions/CompositionsPage.js';
import { AdminComponentsPage } from './pages/admin/AdminComponentsPage.js';
import type { DocPageId } from './types.js';

function getTypographyPreviewStyle(token: string): CSSProperties {
  if (token.includes('-family')) {
    return { fontFamily: `var(${token})` };
  }
  if (token.includes('-size')) {
    return { fontSize: `var(${token})` };
  }
  if (token.includes('-line-height')) {
    return { lineHeight: `var(${token})` };
  }
  if (token.includes('-weight')) {
    return { fontWeight: `var(${token})` };
  }
  if (token.includes('-letter-spacing')) {
    return { letterSpacing: `var(${token})` };
  }
  return {};
}

function getMotionPreviewStyle(token: string): CSSProperties {
  if (token.endsWith('fast') || token.endsWith('normal') || token.endsWith('slow')) {
    return { animationDuration: `var(${token})` };
  }
  return {};
}

export function AppContent({ page }: { page: DocPageId }) {
  if (page === 'overview') {
    return <OverviewPage />;
  }
  if (page === 'installation') {
    return <InstallationPage />;
  }
  if (page === 'usage') {
    return <UsagePage />;
  }
  if (page === 'colors') {
    return (
      <TokenGrid
        title="Colors"
        entries={Object.entries({ ...colorPrimitives, ...semanticLight })}
        preview={(token) => <div className="ds-swatch" style={{ background: `var(${token})` }} />}
      />
    );
  }
  if (page === 'screen-backgrounds') {
    return <ScreenBackgroundsPage />;
  }
  if (page === 'typography') {
    return (
      <TokenGrid
        title="Typography"
        entries={Object.entries(typography)}
        preview={(token) => (
          <AlText className="ds-typo-sample" style={getTypographyPreviewStyle(token)}>
            Typography sample
          </AlText>
        )}
      />
    );
  }
  if (page === 'spacing') {
    return (
      <TokenGrid
        title="Spacing"
        entries={Object.entries(space)}
        preview={(token) => <div className="ds-space-bar" style={{ width: `var(${token})` }} />}
      />
    );
  }
  if (page === 'radius') {
    return (
      <TokenGrid
        title="Radius"
        entries={Object.entries(radius)}
        preview={(token) => <div className="ds-radius-box" style={{ borderRadius: `var(${token})` }} />}
      />
    );
  }
  if (page === 'motion') {
    return (
      <TokenGrid
        title="Motion"
        entries={Object.entries(motion)}
        preview={(token) => <div className="ds-motion-chip" style={getMotionPreviewStyle(token)}>motion</div>}
      />
    );
  }
  if (page === 'brand-logo') {
    return <BrandPage />;
  }
  if (page === 'icons') {
    return <IconsPage />;
  }
  if (page === 'admin-data-table') {
    return <AdminComponentsPage />;
  }
  if (isCoreComponentPage(page)) {
    return <CoreComponentsPage page={page} />;
  }
  if (page === 'composition-index') {
    return <CompositionIndexPage />;
  }
  if (isCompositionPage(page)) {
    return <CompositionsPage page={page} />;
  }
  return <OverviewPage />;
}
