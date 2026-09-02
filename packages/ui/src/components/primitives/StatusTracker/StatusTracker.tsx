import { cn } from '../../../utils/cn';
import { CarIconGlyph } from '../icons/CarIconGlyph';
import { AlDispatchTimeline } from '../DispatchTimeline/DispatchTimeline';

import type { AlStatusTrackerProps } from './StatusTracker.types';
import './StatusTracker.css';

/** Figma 1063:2427 + CC tracker — vehicle chip + timeline. */
export function AlStatusTracker({
  plate,
  model,
  steps,
  variant = 'park-me',
  className,
}: AlStatusTrackerProps) {
  return (
    <div className={cn('al-status-tracker', className)}>
      <div className="al-status-tracker__vehicle">
        <span className="al-status-tracker__vehicle-icon" aria-hidden>
          <CarIconGlyph size={20} />
        </span>
        <div className="al-status-tracker__vehicle-copy">
          <p className="al-status-tracker__plate">{plate}</p>
          <p className="al-status-tracker__model">{model}</p>
        </div>
      </div>
      <AlDispatchTimeline steps={steps} variant={variant} />
    </div>
  );
}
