import type { CoreComponentPageId } from '../../types';

import { AlAvatarPage } from './AlAvatarPage';
import { AlBottomNavPage } from './AlBottomNavPage';
import { AlButtonPage } from './AlButtonPage';
import { AlCheckboxPage } from './AlCheckboxPage';
import { AlChipPage } from './AlChipPage';
import { AlFieldPage } from './AlFieldPage';
import { AlInputPage } from './AlInputPage';
import { AlOtpInputPage } from './AlOtpInputPage';
import { AlPlanCardPage } from './AlPlanCardPage';
import { AlPlateInputPage } from './AlPlateInputPage';
import { AlQuickActionPage } from './AlQuickActionPage';
import { AlStatusPillPage } from './AlStatusPillPage';
import { AlStepProgressPage } from './AlStepProgressPage';
import { AlTextFieldPage } from './AlTextFieldPage';
import { AlTogglePage } from './AlTogglePage';
import { AlVehicleRcCardPage } from './AlVehicleRcCardPage';
import { LayoutComponentPage } from './LayoutComponentPage';
import { StatusBarPage } from './StatusBarPage';

const layoutPages = new Set<CoreComponentPageId>([
  'core-text',
  'core-heading',
  'core-stack',
  'core-grid',
  'core-container',
  'core-divider',
  'core-icon-button',
]);

type LayoutComponentPageId =
  | 'core-text'
  | 'core-heading'
  | 'core-stack'
  | 'core-grid'
  | 'core-container'
  | 'core-divider'
  | 'core-icon-button';

export function CoreComponentsPage({ page }: { page: CoreComponentPageId }) {
  if (layoutPages.has(page)) {
    return <LayoutComponentPage page={page as LayoutComponentPageId} />;
  }

  switch (page) {
    case 'core-button':
      return <AlButtonPage />;
    case 'core-status-pill':
      return <AlStatusPillPage />;
    case 'core-text-field':
      return <AlTextFieldPage />;
    case 'core-input':
      return <AlInputPage />;
    case 'core-otp-input':
      return <AlOtpInputPage />;
    case 'core-toggle':
      return <AlTogglePage />;
    case 'core-checkbox':
      return <AlCheckboxPage />;
    case 'core-chip':
      return <AlChipPage />;
    case 'core-plate-input':
      return <AlPlateInputPage />;
    case 'core-plan-card':
      return <AlPlanCardPage />;
    case 'core-vehicle-rc-card':
      return <AlVehicleRcCardPage />;
    case 'core-avatar':
      return <AlAvatarPage />;
    case 'core-field':
      return <AlFieldPage />;
    case 'core-quick-action':
      return <AlQuickActionPage />;
    case 'core-step-progress':
      return <AlStepProgressPage />;
    case 'core-bottom-nav':
      return <AlBottomNavPage />;
    case 'core-status-bar':
      return <StatusBarPage />;
    default:
      return <AlButtonPage />;
  }
}
