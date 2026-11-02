import { describe, expect, it } from 'vitest';

import { GET as getAasa } from '../../app/.well-known/apple-app-site-association/route';
import { GET as getAssetLinks } from '../../app/.well-known/assetlinks.json/route';
import {
  DEFAULT_ANDROID_PACKAGE,
  DEFAULT_ANDROID_SHA256,
  DEFAULT_IOS_APP_IDS,
  RN_DEBUG_KEYSTORE_SHA256,
  androidIntentUrlForReel,
  appSchemeUrlForReel,
  buildAppleAppSiteAssociation,
  buildAssetLinks,
  normalizeFingerprints,
} from './config';

const FP = 'AB:'.repeat(31) + 'CD';

describe('apple-app-site-association', () => {
  it('claims /r/* and /c/* (plus the legacy paths) for the prod/dev/prodTest apps by default', () => {
    const aasa = buildAppleAppSiteAssociation({});
    const detail = aasa.applinks.details[0];
    expect(detail.appIDs).toEqual(DEFAULT_IOS_APP_IDS);
    expect(detail.appID).toBe('8K33AZH2X2.com.mycompany.indiandriveguide');
    expect(detail.paths).toEqual(
      expect.arrayContaining(['/r/*', '/c/*', '/community/*', '/trip/*']),
    );
    expect(detail.components.slice(0, 2)).toEqual([
      expect.objectContaining({ '/': '/r/*' }),
      expect.objectContaining({ '/': '/c/*' }),
    ]);
  });

  it('takes app ids from APP_LINKS_IOS_APP_IDS', () => {
    const aasa = buildAppleAppSiteAssociation({
      APP_LINKS_IOS_APP_IDS: ' TEAM1.com.a , TEAM1.com.b ',
    });
    expect(aasa.applinks.details[0].appIDs).toEqual(['TEAM1.com.a', 'TEAM1.com.b']);
  });

  it('is served as 200 application/json with no redirect', async () => {
    const res = getAasa();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/json');
    expect(res.headers.get('location')).toBeNull();
    const body = (await res.json()) as ReturnType<typeof buildAppleAppSiteAssociation>;
    expect(body.applinks.details[0].paths).toContain('/r/*');
  });
});

describe('assetlinks.json', () => {
  it('defaults to the live Play package and its published fingerprints', () => {
    expect(buildAssetLinks({})).toEqual([
      {
        relation: [
          'delegate_permission/common.handle_all_urls',
          'delegate_permission/common.get_login_creds',
        ],
        target: {
          namespace: 'android_app',
          package_name: DEFAULT_ANDROID_PACKAGE,
          sha256_cert_fingerprints: DEFAULT_ANDROID_SHA256,
        },
      },
    ]);
  });

  it('reads package + fingerprints from env, normalizing case and dropping invalid values', () => {
    const stmt = buildAssetLinks({
      APP_LINKS_ANDROID_PACKAGE: 'com.example.app',
      APP_LINKS_ANDROID_SHA256: `${FP.toLowerCase()}, not-a-fingerprint, ${FP}`,
    })[0];
    expect(stmt.target).toEqual({
      namespace: 'android_app',
      package_name: 'com.example.app',
      sha256_cert_fingerprints: [FP],
    });
  });

  it('omits the prod statement when no valid fingerprint is configured', () => {
    expect(buildAssetLinks({ APP_LINKS_ANDROID_SHA256: 'nope' })).toEqual([]);
  });

  it('adds a dev package (RN debug keystore fingerprint by default)', () => {
    const statements = buildAssetLinks({ APP_LINKS_ANDROID_DEV_PACKAGE: 'com.example.app.dev' });
    expect(statements[1].target).toEqual({
      namespace: 'android_app',
      package_name: 'com.example.app.dev',
      sha256_cert_fingerprints: [RN_DEBUG_KEYSTORE_SHA256],
    });
  });

  it('is served as 200 application/json', async () => {
    const res = getAssetLinks();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/json');
    expect(Array.isArray(await res.json())).toBe(true);
  });

  it('normalizeFingerprints dedupes', () => {
    expect(normalizeFingerprints([FP, FP.toLowerCase()])).toEqual([FP]);
  });
});

describe('open-in-app URLs', () => {
  it('uses the app scheme / an Android intent with a Play Store fallback', () => {
    expect(appSchemeUrlForReel('a b')).toBe('autolokate://discover/spotlight?startId=a%20b');
    const intent = androidIntentUrlForReel('abc');
    expect(intent).toContain('intent://discover/spotlight?startId=abc#Intent;scheme=autolokate;');
    expect(intent).toContain('package=com.mycompany.indiandriveguide');
    expect(intent).toContain(
      `S.browser_fallback_url=${encodeURIComponent('https://play.google.com/store/apps/details?id=com.mycompany.indiandriveguide')}`,
    );
  });
});
