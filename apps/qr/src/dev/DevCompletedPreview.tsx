import { useEffect } from 'react';

import { JourneyCompletedScreen } from '@/journey/screens/JourneyCompletedScreen.js';
import { useJourney } from '@/journey/JourneyContext.js';

/** Dev preview seed — Figma 171:59 plate + Secure plan for capture parity. */
export function DevCompletedPreview() {
  const { updateSession } = useJourney();

  useEffect(() => {
    updateSession({
      vehicle: { plate: 'MH12AB3456' },
      purchase: { selectedPlanId: 'secure' },
    });
  }, [updateSession]);

  return <JourneyCompletedScreen />;
}
