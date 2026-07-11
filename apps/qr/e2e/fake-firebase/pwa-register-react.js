/** Stand-in for `virtual:pwa-register/react` (VitePWA is not loaded in the FID harness config). */
export function useRegisterSW() {
  return {
    needRefresh: [false, () => undefined],
    offlineReady: [false, () => undefined],
    updateServiceWorker: () => Promise.resolve(),
  };
}
