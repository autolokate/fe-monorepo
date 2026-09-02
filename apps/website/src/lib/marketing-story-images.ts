/**
 * Curated marketing visuals — single source of truth.
 * Every path maps to a real, story-matched asset (no stock placeholders).
 */
export const MARKETING_STORY_IMAGES = {
  /** Homepage journey */
  problemScene: '/images/home/story/problem-crash-scene.png',
  detectionRadar: '/images/home/story/detection-impact-phone.png',
  /** Crash coordination UI — how-it-works hero, flagship phone mockup */
  controlCenterPhone: '/images/home/story/control-center-live.jpg',
  /** App dashboard hub — products flagship */
  controlCenterCoordinator: '/images/home/story/control-center-coordinator.png',
  /** Control Center phone UI — homepage + features */
  controlCenterCoordinates: '/images/home/story/control-center-coordinates.png',
  /** Legacy ops hub visual */
  controlCenterOperations: '/images/home/story/control-center-operations.png',
  /** Logo hub — features “every channel activated” chapter */
  responseNetworkHome: '/images/home/story/response-network-hub.png',
  /** Crash SOS phone — homepage response network animation */
  responseNetworkPhone: '/images/home/story/response-network-phone.png',
  /** Crash scene — features “every channel activated” chapter */
  responseNetworkCrash: '/images/home/story/response-network-crash.png',
  /** Smart QR app UI — scan sticker → Control Center flow */
  smartQrEcosystem: '/images/home/story/smart-qr-app-phone.png',
  /** Founder portrait — homepage Trust section */
  founderPortrait: '/images/home/story/founder-deepak-chaudhary.png',

  /** Page heroes */
  featuresHero: '/images/home/story/app-screens-collage.png',
  ecosystemWheel: '/images/home/story/ecosystem-wheel.png',

  /** Product photography */
  qrSticker: '/images/new-design/how-it-works/qr-sticker.png',

  /** Homepage hero media */
  heroVideo: '/videos/home/hero-scene.mp4?v=4',
  heroPoster: '/images/home/hero/intersection-calm.png',

  /** Homepage closing CTA — app onboarding mockup */
  closingProtectionApp: '/images/home/story/closing-protection-app.png',
} as const;
