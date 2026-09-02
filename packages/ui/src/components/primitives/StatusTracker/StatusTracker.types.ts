import type {
  AlDispatchTimelineStep,
  AlDispatchTimelineVariant,
} from '../DispatchTimeline/DispatchTimeline.types';

export type AlStatusTrackerProps = {
  plate: string;
  model: string;
  steps: readonly AlDispatchTimelineStep[];
  variant?: AlDispatchTimelineVariant;
  className?: string;
};
