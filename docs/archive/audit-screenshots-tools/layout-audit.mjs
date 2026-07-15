import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'http://127.0.0.1:5175';
const OUT = join(import.meta.dirname, 'layout-audit-results.json');
const STORAGE_KEY = 'al-pwa-scan-v1';

const VIEWPORTS = [320, 360, 375, 390, 393, 414];
const THEMES = ['dark', 'light'];
const VIEWPORT_HEIGHT = 852;

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
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23424557" width="400" height="300"/></svg>',
    rear: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%231f2129" width="400" height="300"/></svg>',
  },
  location: { lat: 19.076, lng: 72.8777 },
  parkMeStatus: 'idle',
  sosPhotos: { front: null, rear: null, left: null, right: null },
  sosStatus: 'idle',
  simulateNetworkFail: false,
  locationDenied: false,
};

const screens = [
  {
    id: '01',
    file: '01-loading',
    path: '/pwa/scan/loading',
    session: { bootstrapComplete: false },
  },
  { id: '02', file: '02-vehicle-found', path: '/pwa/scan/vehicle' },
  {
    id: '03',
    file: '03-verify-mobile',
    path: '/pwa/scan/verify/mobile',
    session: { verified: false, mobile: '', consentAccepted: false },
  },
  {
    id: '04',
    file: '04-verify-otp',
    path: '/pwa/scan/verify/otp',
    session: { verified: false, mobile: '9999999999', consentAccepted: true },
  },
  {
    id: '05',
    file: '05-verify-name',
    path: '/pwa/scan/verify/name',
    session: { verified: false, mobile: '9999999999', consentAccepted: true },
  },
  { id: '06', file: '06-park-me-vehicle-number', path: '/pwa/scan/park-me/vehicle-number' },
  { id: '07', file: '07-park-me-looking-up', path: '/pwa/scan/park-me/looking-up' },
  {
    id: '08',
    file: '08-park-me-confirm',
    path: '/pwa/scan/park-me/confirm',
    session: { reporterProtected: false, reporterPlanLabel: null },
  },
  { id: '08b', file: '08b-park-me-confirm-protected', path: '/pwa/scan/park-me/confirm-protected' },
  { id: '09a', file: '09a-park-me-permissions', path: '/pwa/scan/park-me/permissions' },
  {
    id: '09',
    file: '09-park-me-photos',
    path: '/pwa/scan/park-me/photos',
    session: { parkMePhotos: { front: null, rear: null }, location: null },
  },
  { id: '09b', file: '09b-park-me-review', path: '/pwa/scan/park-me/review' },
  {
    id: '10',
    file: '10-park-me-checking',
    path: '/pwa/scan/park-me/status/checking',
    session: { parkMeStatus: 'checking' },
  },
  {
    id: '11',
    file: '11-park-me-calling',
    path: '/pwa/scan/park-me/status/calling',
    session: { parkMeStatus: 'calling' },
  },
  {
    id: '12',
    file: '12-park-me-resolved',
    path: '/pwa/scan/park-me/status/resolved',
    session: { parkMeStatus: 'resolved' },
  },
  {
    id: '13',
    file: '13-photo-not-clear',
    path: '/pwa/scan/park-me/photo-not-clear',
    session: { parkMeStatus: 'photo-error', name: 'Photo Fail' },
  },
  {
    id: '14',
    file: '14-sos',
    path: '/pwa/scan/sos',
    session: { location: null, locationDenied: false },
  },
  {
    id: '14b',
    file: '14b-sos-holding',
    path: '/pwa/scan/sos/holding',
    session: { sosStatus: 'holding' },
  },
  { id: '14c', file: '14c-sos-allow-location', path: '/pwa/scan/sos/allow-location' },
  { id: '14d', file: '14d-sos-leave-confirm', path: '/pwa/scan/sos/leave-confirm' },
  {
    id: '15',
    file: '15-sos-scene-photos',
    path: '/pwa/scan/sos/scene-photos',
    session: { sosStatus: 'scene' },
  },
  {
    id: '15b',
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
    id: '16',
    file: '16-location-unavailable',
    path: '/pwa/scan/sos/location-unavailable',
    session: { locationDenied: true },
  },
  {
    id: '17',
    file: '17-sending-alert',
    path: '/pwa/scan/sos/sending',
    session: { sosStatus: 'sending' },
  },
  {
    id: '18',
    file: '18-couldnt-send',
    path: '/pwa/scan/sos/couldnt-send',
    session: { simulateNetworkFail: true, sosStatus: 'network-error' },
  },
  {
    id: '19',
    file: '19-help-received',
    path: '/pwa/scan/sos/help-received',
    session: { sosStatus: 'help-received' },
  },
  {
    id: '20',
    file: '20-help-dispatched',
    path: '/pwa/scan/sos/help-dispatched',
    session: { sosStatus: 'dispatched' },
  },
  {
    id: '21',
    file: '21-incident-resolved',
    path: '/pwa/scan/sos/resolved',
    session: { sosStatus: 'resolved' },
  },
  {
    id: '22',
    file: '22-alert-cancelled',
    path: '/pwa/scan/sos/alert-cancelled',
    session: { sosStatus: 'cancelled' },
  },
  {
    id: '23',
    file: '23-contacts-only',
    path: '/pwa/scan/sos/contacts-only',
    session: { sosStatus: 'contacts-only', location: null },
  },
];

const FOCUS = new Set(['09', '09b', '10', '11', '12', '13', '14', '15', '19', '20', '21', '23']);

async function inspectLayout(page) {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const issues = [];

    const add = (type, severity, detail, selector, component) => {
      issues.push({ type, severity, detail, selector, component });
    };

    // Horizontal overflow
    const docW = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    if (docW > vw + 1) {
      add(
        'overflow-x',
        'P0',
        `Document scrollWidth ${docW}px exceeds viewport ${vw}px`,
        'document',
        'shell',
      );
    }

    // Find elements causing horizontal overflow
    for (const el of document.querySelectorAll('*')) {
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      if (rect.right > vw + 2 || rect.left < -2) {
        const style = getComputedStyle(el);
        if (style.position === 'fixed' || style.visibility === 'hidden') continue;
        const tag = el.tagName.toLowerCase();
        const cls = (el.className && String(el.className).slice(0, 80)) || '';
        if (rect.right > vw + 2) {
          add(
            'overflow-x',
            'P1',
            `Element extends ${Math.round(rect.right - vw)}px past right edge`,
            `${tag}.${cls.split(' ')[0]}`,
            cls.split(' ')[0] || tag,
          );
          break;
        }
      }
    }

    // Main scroll when shell should be fixed viewport
    const shell = document.querySelector('.pwa-scan-shell__frame');
    const main = document.querySelector('.pwa-scan-shell__main');
    const footer = document.querySelector('.pwa-scan-shell__footer');
    const scrollH = document.documentElement.scrollHeight;
    const hasVerticalScroll = scrollH > vh + 2;

    if (hasVerticalScroll && shell) {
      add(
        'wrong-scroll',
        'P1',
        `Page scrollHeight ${scrollH}px > viewport ${vh}px — content pushes beyond fold without internal scroll`,
        '.pwa-scan-shell',
        'PwaScanShell',
      );
    }

    // Main overflow hidden clipping
    if (main) {
      const mainStyle = getComputedStyle(main);
      const mainRect = main.getBoundingClientRect();
      const mainScroll = main.scrollHeight > main.clientHeight + 2;
      const children = main.querySelectorAll('*');
      for (const child of children) {
        const cr = child.getBoundingClientRect();
        if (cr.bottom > mainRect.bottom + 4 && cr.top < mainRect.bottom) {
          const cs = getComputedStyle(child);
          if (mainStyle.overflow === 'hidden' || mainStyle.overflowY === 'hidden') {
            add(
              'clipping',
              'P0',
              `Content clipped by main overflow hidden`,
              child.className?.toString?.()?.split?.(' ')?.[0] || child.tagName,
              'PwaScanShell',
            );
            break;
          }
        }
      }
      if (mainScroll && mainStyle.overflowY === 'visible') {
        // timeline screens - content scrolls page instead of main
      }
    }

    // Footer CTA visibility
    const footerButtons = document.querySelectorAll(
      '.pwa-scan-shell__footer .al-button, .pwa-scan-shell__footer button',
    );
    for (const btn of footerButtons) {
      const r = btn.getBoundingClientRect();
      const visible = r.top < vh && r.bottom > 0 && r.height > 0;
      const fullyVisible = r.top >= 0 && r.bottom <= vh - 1;
      if (!visible) {
        add(
          'cta-hidden',
          'P0',
          `Footer CTA not in viewport (top=${Math.round(r.top)}, bottom=${Math.round(r.bottom)})`,
          '.pwa-scan-shell__footer .al-button',
          'AlButton',
        );
      } else if (!fullyVisible && r.bottom > vh) {
        add(
          'cta-clipped',
          'P0',
          `Footer CTA clipped below fold by ${Math.round(r.bottom - vh)}px`,
          '.pwa-scan-shell__footer .al-button',
          'AlButton',
        );
      } else if (r.top > vh - 80 && hasVerticalScroll) {
        add(
          'cta-near-fold',
          'P1',
          `Footer CTA only ${Math.round(vh - r.bottom)}px from bottom edge with page scroll`,
          '.pwa-scan-shell__footer .al-button',
          'AlButton',
        );
      }
    }

    // PurchaseStatusShell CTAs
    const purchaseBtn = document.querySelector(
      '.purchase-status-shell__footer .al-button, [class*="purchase-status"] button',
    );
    if (purchaseBtn) {
      const r = purchaseBtn.getBoundingClientRect();
      if (r.bottom > vh + 1) {
        add(
          'cta-clipped',
          'P0',
          `PurchaseStatusShell CTA clipped below fold`,
          '.purchase-status-shell',
          'PurchaseStatusShell',
        );
      }
    }

    // Timeline overlap with footer
    const timeline = document.querySelector('.al-dispatch-timeline');
    if (timeline && footer) {
      const tr = timeline.getBoundingClientRect();
      const fr = footer.getBoundingClientRect();
      if (tr.bottom > fr.top - 8 && fr.top < vh) {
        add(
          'timeline-footer-overlap',
          'P0',
          `Timeline bottom (${Math.round(tr.bottom)}px) overlaps footer top (${Math.round(fr.top)}px)`,
          '.al-dispatch-timeline',
          'AlDispatchTimeline',
        );
      }
      if (tr.bottom > vh && footerButtons.length === 0) {
        add(
          'timeline-offscreen',
          'P1',
          `Timeline extends ${Math.round(tr.bottom - vh)}px below viewport with no footer CTA`,
          '.al-dispatch-timeline',
          'AlDispatchTimeline',
        );
      }
    }

    // SOS hold button collisions
    const sosHold = document.querySelector('.al-sos-hold');
    if (sosHold) {
      const stage = sosHold.querySelector('.al-sos-hold__stage');
      const disc = sosHold.querySelector('.al-sos-hold__disc');
      if (stage && disc) {
        const sr = stage.getBoundingClientRect();
        const dr = disc.getBoundingClientRect();
        // Check if aura extends past viewport horizontally
        if (sr.left < -10 || sr.right > vw + 10) {
          add(
            'hero-overflow',
            'P1',
            `SOS aura stage overflows viewport horizontally`,
            '.al-sos-hold__stage',
            'AlSosHoldButton',
          );
        }
      }
      // Check overlap with location chip below
      const chip = document.querySelector('.pwa-scan-sos-screen__location-chip');
      if (chip && disc) {
        const cr = chip.getBoundingClientRect();
        const dr = disc.getBoundingClientRect();
        if (cr.top < dr.bottom - 20) {
          add(
            'component-collision',
            'P1',
            `Location chip overlaps SOS disc by ${Math.round(dr.bottom - cr.top)}px`,
            '.pwa-scan-sos-screen__location-chip',
            'AlSosHoldButton',
          );
        }
      }
    }

    // Photo grid overflow on narrow widths
    const photoGrid = document.querySelector('.al-photo-grid');
    if (photoGrid) {
      const gr = photoGrid.getBoundingClientRect();
      if (gr.width > vw - 32) {
        add(
          'grid-overflow',
          'P1',
          `Photo grid width ${Math.round(gr.width)}px exceeds content area`,
          '.al-photo-grid',
          'AlPhotoGrid',
        );
      }
    }

    // Review screen - content below fold without scroll affordance
    const review = document.querySelector('.al-photo-grid--review');
    if (review) {
      const rr = review.getBoundingClientRect();
      const footerBtn = document.querySelector('.pwa-scan-shell__footer .al-button');
      if (footerBtn) {
        const br = footerBtn.getBoundingClientRect();
        if (rr.bottom > br.top - 16) {
          add(
            'photo-footer-overlap',
            'P0',
            `Review grid overlaps footer CTA zone`,
            '.al-photo-grid--review',
            'AlPhotoGrid',
          );
        }
      }
      if (hasVerticalScroll && rr.bottom > vh * 0.55) {
        add(
          'review-crush',
          'P1',
          `Review content + footer requires scroll — primary CTA may be off-screen initially`,
          '.al-photo-grid--review',
          'AlPhotoGrid',
        );
      }
    }

    // Permission sheet blocking interaction incorrectly
    const sheet = document.querySelector('.al-permission-sheet');
    if (sheet) {
      const sr = sheet.getBoundingClientRect();
      if (sr.height < 100) {
        add(
          'sheet-collapse',
          'P0',
          `Permission sheet collapsed height ${Math.round(sr.height)}px`,
          '.al-permission-sheet',
          'AlPermissionSheet',
        );
      }
    }

    // Vehicle chip + heading collision on narrow
    const tracker = document.querySelector('.al-status-tracker');
    if (tracker) {
      const chip = tracker.querySelector('.al-status-tracker__vehicle');
      if (chip) {
        const cr = chip.getBoundingClientRect();
        if (cr.width > vw - 32) {
          add(
            'chip-overflow',
            'P0',
            `Vehicle chip width ${Math.round(cr.width)}px overflows content column`,
            '.al-status-tracker__vehicle',
            'AlStatusTracker',
          );
        }
      }
    }

    // Text wrapping causing layout break
    const headings = document.querySelectorAll('h1, .al-heading');
    for (const h of headings) {
      const hr = h.getBoundingClientRect();
      if (hr.height > 120) {
        add(
          'text-wrap-break',
          'P2',
          `Heading height ${Math.round(hr.height)}px suggests excessive wrap`,
          h.className?.toString?.()?.split?.(' ')?.[0] || 'h1',
          'AlHeading',
        );
      }
    }

    // Halo animation causing layout shift (measure twice would need external - skip)

    // Stacked z-index: sheet over SOS
    const sheetOpen = document.querySelector(
      '.al-permission-sheet[open], .al-permission-sheet--open, .al-permission-sheet',
    );
    if (sheetOpen) {
      const backdrop = document.querySelector(
        '.al-permission-sheet__backdrop, [class*="permission"]',
      );
    }

    return {
      viewport: { w: vw, h: vh },
      scrollHeight: scrollH,
      hasVerticalScroll,
      hasHorizontalScroll: docW > vw + 1,
      issueCount: issues.length,
      issues,
      metrics: {
        footerTop: footer?.getBoundingClientRect()?.top ?? null,
        footerBottom: footer?.getBoundingClientRect()?.bottom ?? null,
        mainBottom: main?.getBoundingClientRect()?.bottom ?? null,
        timelineBottom: timeline?.getBoundingClientRect()?.bottom ?? null,
        sosHoldBottom: sosHold?.getBoundingClientRect()?.bottom ?? null,
      },
    };
  });
}

const results = [];
const browser = await chromium.launch();

for (const theme of THEMES) {
  for (const width of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width, height: VIEWPORT_HEIGHT },
      deviceScaleFactor: 1,
      colorScheme: theme,
    });

    for (const screen of screens) {
      const page = await context.newPage();
      const session = { ...baseSession, ...screen.session };

      await page.addInitScript(
        ({ key, value, themeAttr }) => {
          window.sessionStorage.setItem(key, JSON.stringify(value));
          document.documentElement.setAttribute('data-theme', themeAttr);
        },
        { key: STORAGE_KEY, value: session, themeAttr: theme },
      );

      await page.goto(`${BASE}${screen.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(screen.file.includes('loading') ? 300 : 700);

      const layout = await inspectLayout(page);
      await page.close();

      const entry = {
        screen: screen.id,
        file: screen.file,
        path: screen.path,
        focus: FOCUS.has(screen.id),
        theme,
        width,
        ...layout,
      };
      results.push(entry);

      if (layout.issues.some((i) => i.severity === 'P0')) {
        console.log(
          `P0 ${screen.id} ${width}px ${theme}:`,
          layout.issues
            .filter((i) => i.severity === 'P0')
            .map((i) => i.type)
            .join(', '),
        );
      }
    }

    await context.close();
  }
}

await browser.close();

writeFileSync(OUT, JSON.stringify(results, null, 2));
console.log('Wrote', OUT, 'entries:', results.length);
