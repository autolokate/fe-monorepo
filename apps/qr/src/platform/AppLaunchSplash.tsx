import { useState, type ReactNode } from 'react';

import { S0SplashScreen } from '@/features/shared-auth/screens/s0-splash/index';

type AppLaunchSplashProps = {
  children: ReactNode;
};

/** Shows S0 splash on cold start before journey routes render. */
export function AppLaunchSplash({ children }: AppLaunchSplashProps) {
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return (
      <S0SplashScreen
        onComplete={() => {
          setSplashDone(true);
        }}
      />
    );
  }

  return children;
}
