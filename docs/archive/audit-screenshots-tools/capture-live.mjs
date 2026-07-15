import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5175';
const OUT = join(import.meta.dirname, process.env.OUT_DIR ?? 'live');
const STORAGE_KEY = 'al-pwa-scan-v1';

mkdirSync(OUT, { recursive: true });

const baseSession = {
  bootstrapComplete: true,
  verified: true,
  mobile: '9999999999',
  name: 'Kapil',
  consentAccepted: true,
  pendingFlow: null,
  scannedVehicle: {
    plate: 'MH 12 AB 1234',
    modelSummary: 'White · Maruti Swift',
    protected: true,
    planLabel: 'Safe',
    fields: [],
  },
  reporterPlate: 'MH 12 AB 3456',
  reporterFields: [],
  reporterProtected: true,
  reporterPlanLabel: 'Safe',
  permissionsGranted: true,
  parkMePhotos: {
    front:
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="361" height="160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="%23424557"/><stop offset="1" stop-color="%231f2129"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/></svg>',
    rear: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="361" height="160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="%23424557"/><stop offset="1" stop-color="%231f2129"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/></svg>',
  },
  location: { lat: 19.076, lng: 72.8777 },
  parkMeStatus: 'idle',
  sosPhotos: { front: null, rear: null, left: null, right: null },
  sosStatus: 'idle',
  simulateNetworkFail: false,
  locationDenied: false,
};

const screens = [
  { file: '01-loading', path: '/pwa/scan/loading', session: { bootstrapComplete: false } },
  { file: '02-vehicle-found', path: '/pwa/scan/vehicle' },
  {
    file: '03-verify-mobile',
    path: '/pwa/scan/verify/mobile',
    session: { verified: false, mobile: '', consentAccepted: false },
  },
  {
    file: '04-verify-otp',
    path: '/pwa/scan/verify/otp',
    session: { verified: false, mobile: '9999999999', consentAccepted: true },
  },
  {
    file: '05-verify-name',
    path: '/pwa/scan/verify/name',
    session: { verified: false, mobile: '9999999999', consentAccepted: true },
  },
  { file: '06-park-me-vehicle-number', path: '/pwa/scan/park-me/vehicle-number' },
  { file: '07-park-me-looking-up', path: '/pwa/scan/park-me/looking-up' },
  {
    file: '08-park-me-confirm',
    path: '/pwa/scan/park-me/confirm',
    session: { reporterProtected: false, reporterPlanLabel: null },
  },
  { file: '08b-park-me-confirm-protected', path: '/pwa/scan/park-me/confirm-protected' },
  { file: '09a-park-me-permissions', path: '/pwa/scan/park-me/permissions' },
  {
    file: '09-park-me-photos',
    path: '/pwa/scan/park-me/photos',
    session: { parkMePhotos: { front: null, rear: null }, location: null },
  },
  { file: '09b-park-me-review', path: '/pwa/scan/park-me/review' },
  {
    file: '10-park-me-checking',
    path: '/pwa/scan/park-me/status/checking',
    session: { parkMeStatus: 'checking' },
  },
  {
    file: '11-park-me-calling',
    path: '/pwa/scan/park-me/status/calling',
    session: { parkMeStatus: 'calling' },
  },
  {
    file: '12-park-me-resolved',
    path: '/pwa/scan/park-me/status/resolved',
    session: { parkMeStatus: 'resolved' },
  },
  {
    file: '13-photo-not-clear',
    path: '/pwa/scan/park-me/photo-not-clear',
    session: { parkMeStatus: 'photo-error', name: 'Photo Fail' },
  },
  { file: '14-sos', path: '/pwa/scan/sos', session: { location: null, locationDenied: false } },
  { file: '14b-sos-holding', path: '/pwa/scan/sos/holding', session: { sosStatus: 'holding' } },
  { file: '14c-sos-allow-location', path: '/pwa/scan/sos/allow-location' },
  { file: '14d-sos-leave-confirm', path: '/pwa/scan/sos/leave-confirm' },
  {
    file: '15-sos-scene-photos',
    path: '/pwa/scan/sos/scene-photos',
    session: { sosStatus: 'scene' },
  },
  {
    file: '15b-sos-scene-captured',
    path: '/pwa/scan/sos/scene-photos/captured',
    session: {
      sosPhotos: {
        front: 'data:image/svg+xml,<svg/>',
        rear: 'data:image/svg+xml,<svg/>',
        left: 'data:image/svg+xml,<svg/>',
        right: 'data:image/svg+xml,<svg/>',
      },
    },
  },
  {
    file: '16-location-unavailable',
    path: '/pwa/scan/sos/location-unavailable',
    session: { locationDenied: true },
  },
  { file: '17-sending-alert', path: '/pwa/scan/sos/sending', session: { sosStatus: 'sending' } },
  {
    file: '18-couldnt-send',
    path: '/pwa/scan/sos/couldnt-send',
    session: { simulateNetworkFail: true, sosStatus: 'network-error' },
  },
  {
    file: '19-help-received',
    path: '/pwa/scan/sos/help-received',
    session: { sosStatus: 'help-received' },
  },
  {
    file: '20-help-dispatched',
    path: '/pwa/scan/sos/help-dispatched',
    session: { sosStatus: 'dispatched' },
  },
  {
    file: '21-incident-resolved',
    path: '/pwa/scan/sos/resolved',
    session: { sosStatus: 'resolved' },
  },
  {
    file: '22-alert-cancelled',
    path: '/pwa/scan/sos/alert-cancelled',
    session: { sosStatus: 'cancelled' },
  },
  {
    file: '23-contacts-only',
    path: '/pwa/scan/sos/contacts-only',
    session: { sosStatus: 'contacts-only', location: null },
  },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
});

for (const screen of screens) {
  const page = await context.newPage();
  const session = { ...baseSession, ...screen.session };
  await page.addInitScript(
    ({ key, value }) => {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    },
    { key: STORAGE_KEY, value: session },
  );

  await page.goto(`${BASE}${screen.path}`, { waitUntil: 'networkidle' });

  if (screen.file === '01-loading') {
    await page.waitForTimeout(300);
  } else if (screen.file === '07-park-me-looking-up') {
    await page.waitForTimeout(400);
  } else {
    await page.waitForTimeout(800);
  }

  await page.screenshot({ path: join(OUT, `${screen.file}.png`), fullPage: false });
  await page.close();
  console.log('captured', screen.file);
}

await browser.close();
