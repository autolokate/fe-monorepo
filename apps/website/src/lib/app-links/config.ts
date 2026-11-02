/**
 * Universal links (iOS) / verified App Links (Android) for autolokate.com share URLs.
 *
 * Served at `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json` (route
 * handlers, read at REQUEST time so the values are runtime env — no rebuild to rotate a cert).
 *
 * Defaults mirror what https://autolokate.com serves today (the live Vercel site, verified
 * 2026-11-02) plus the new `/r/*` (reel) and `/c/*` (garage clip) share paths:
 *  - iOS appIDs: Team 8K33AZH2X2 + the prod / dev / prodTest bundle ids from the consumer app's
 *    Xcode project. Override with `APP_LINKS_IOS_APP_IDS` (comma-separated `TEAMID.bundleId`).
 *  - Android: package `com.mycompany.indiandriveguide` (the LIVE Play listing) and the four SHA-256
 *    signing-cert fingerprints the live assetlinks.json lists.
 *    TODO(owner): confirm these against Play Console → Setup → App integrity (App signing key
 *    certificate + upload key) and set `APP_LINKS_ANDROID_SHA256` explicitly in the website env.
 *    Override package with `APP_LINKS_ANDROID_PACKAGE`; optional extra (dev) target with
 *    `APP_LINKS_ANDROID_DEV_PACKAGE` + `APP_LINKS_ANDROID_DEV_SHA256`.
 */

export const APP_SCHEME = 'autolokate';
export const ANDROID_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.mycompany.indiandriveguide';
export const IOS_STORE_URL = 'https://apps.apple.com/in/app/idg-autolokate/id6733244175';

export const DEFAULT_IOS_APP_IDS = [
  '8K33AZH2X2.com.mycompany.indiandriveguide',
  '8K33AZH2X2.com.mycompany.indiandriveguide.dev',
  '8K33AZH2X2.com.mycompany.indiandriveguide.prodTest',
];

export const DEFAULT_ANDROID_PACKAGE = 'com.mycompany.indiandriveguide';

/** Fingerprints published today by https://autolokate.com/.well-known/assetlinks.json. */
export const DEFAULT_ANDROID_SHA256 = [
  '0A:7D:84:34:0C:01:2C:F2:07:E6:66:64:9C:5A:F7:70:6F:60:03:C6:1C:16:53:9E:C2:9E:27:6D:D3:9B:7F:10',
  '04:B8:57:A8:A8:F5:E7:19:FB:D5:67:E8:40:85:8F:D5:E9:46:A4:95:CB:02:34:E5:6F:FB:55:C0:80:F0:0F:57',
  '12:C4:29:2D:FF:D3:47:50:AE:11:85:94:63:AE:73:06:8F:12:E9:8E:EB:7A:D4:25:94:C1:9A:B9:BD:46:2C:5D',
  '59:EB:D5:50:9A:6E:96:7A:78:35:D8:8D:5A:72:E4:E5:A8:F6:87:1E:B0:55:D8:94:67:5B:8E:7F:E1:C8:B3:E9',
];

/** The React Native template debug keystore (android/app/debug.keystore in the consumer repo). */
export const RN_DEBUG_KEYSTORE_SHA256 =
  'FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C';

/** Paths the live site already claims for the app — kept so existing links keep opening it. */
const LEGACY_PATHS = [
  '/community/*',
  '/question/*',
  '/chat/*',
  '/trip/*',
  '/inbox/*',
  '/inbox',
  '/service-schedule',
  '/service-schedule/*',
];

/** New share paths: `/r/{reelId}` and `/c/{clipId}`. */
export const SHARE_PATHS = ['/r/*', '/c/*'];

type Env = Record<string, string | undefined>;

function list(raw: string | undefined): string[] | null {
  const items = (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

const SHA256_RE = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

/** Upper-case, validate, dedupe SHA-256 fingerprints (`AA:BB:…`, 32 bytes). Invalid ones are dropped. */
export function normalizeFingerprints(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim().toUpperCase()).filter((v) => SHA256_RE.test(v)))];
}

export function iosAppIds(env: Env = process.env): string[] {
  return list(env.APP_LINKS_IOS_APP_IDS) ?? DEFAULT_IOS_APP_IDS;
}

/** `apple-app-site-association` JSON (applinks only; no file extension, served as application/json). */
export function buildAppleAppSiteAssociation(env: Env = process.env) {
  const appIDs = iosAppIds(env);
  return {
    applinks: {
      apps: [],
      details: [
        {
          appIDs,
          // `appID` + `paths` for iOS 12 and older; `components` for iOS 13+.
          appID: appIDs[0],
          paths: [...SHARE_PATHS, ...LEGACY_PATHS],
          components: [
            { '/': '/r/*', comment: 'Shared reel: /r/{reelId}' },
            { '/': '/c/*', comment: 'Shared garage clip: /c/{clipId}' },
            { '/': '/question/*', comment: 'Matches any question URL like /question/123' },
            { '/': '/community/*', comment: 'Matches any community URL like /community/456' },
            { '/': '/trip/*', comment: 'Matches any trip URL like /trip/789' },
            { '/': '/inbox*', comment: 'Matches inbox and inbox/chat URLs' },
            {
              '/': '/service-schedule*',
              '?': { id: '*' },
              comment: 'Service schedule share link with id query param',
            },
            {
              '/': '/service-schedule*',
              '?': { brand: '*' },
              comment: 'Service schedule share link with brand query param',
            },
          ],
        },
      ],
    },
  };
}

interface AssetLinkStatement {
  relation: string[];
  target: { namespace: 'android_app'; package_name: string; sha256_cert_fingerprints: string[] };
}

/** Digital Asset Links statements (`/.well-known/assetlinks.json`). */
export function buildAssetLinks(env: Env = process.env): AssetLinkStatement[] {
  const relation = [
    'delegate_permission/common.handle_all_urls',
    'delegate_permission/common.get_login_creds',
  ];
  const statements: AssetLinkStatement[] = [];
  const prodFingerprints = normalizeFingerprints(
    list(env.APP_LINKS_ANDROID_SHA256) ?? DEFAULT_ANDROID_SHA256,
  );
  if (prodFingerprints.length > 0) {
    statements.push({
      relation,
      target: {
        namespace: 'android_app',
        package_name: env.APP_LINKS_ANDROID_PACKAGE?.trim() || DEFAULT_ANDROID_PACKAGE,
        sha256_cert_fingerprints: prodFingerprints,
      },
    });
  }
  const devPackage = env.APP_LINKS_ANDROID_DEV_PACKAGE?.trim();
  if (devPackage) {
    const devFingerprints = normalizeFingerprints(
      list(env.APP_LINKS_ANDROID_DEV_SHA256) ?? [RN_DEBUG_KEYSTORE_SHA256],
    );
    if (devFingerprints.length > 0) {
      statements.push({
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: devPackage,
          sha256_cert_fingerprints: devFingerprints,
        },
      });
    }
  }
  return statements;
}

/** Response headers for both well-known files: JSON, cacheable for an hour, no redirect. */
export const WELL_KNOWN_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=3600',
} as const;

/** Custom-scheme URL the "Open in app" button tries (the app's existing AutoClips deep link). */
export function appSchemeUrlForReel(id: string): string {
  return `${APP_SCHEME}://discover/spotlight?startId=${encodeURIComponent(id)}`;
}

/**
 * Android intent URL: opens the app when installed, else Chrome falls back to the Play listing.
 * (`S.browser_fallback_url` — https://developer.chrome.com/docs/android/intents)
 */
export function androidIntentUrlForReel(id: string, pkg: string = DEFAULT_ANDROID_PACKAGE): string {
  const fallback = encodeURIComponent(ANDROID_STORE_URL);
  return `intent://discover/spotlight?startId=${encodeURIComponent(id)}#Intent;scheme=${APP_SCHEME};package=${pkg};S.browser_fallback_url=${fallback};end`;
}
