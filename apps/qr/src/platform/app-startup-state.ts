/** Set once after cold-start bootstrap completes (splash + session check). */
let appStartupComplete = false;

export function markAppStartupComplete(): void {
  appStartupComplete = true;
}

export function isAppStartupComplete(): boolean {
  return appStartupComplete;
}
