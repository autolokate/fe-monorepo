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
  /** Smart QR backup flow — how-it-works backup layer phone mockup */
  smartQrBackupPhone: '/images/home/story/smart-qr-backup-phone.png',
  /** Founder portrait — homepage Trust section */
  founderPortrait: '/images/home/story/founder-deepak-chaudhary.png',
  /** How it works page hero — detection-to-help flow */
  howItWorksHero: '/images/home/story/how-it-works-hero.png',

  /** Page heroes */
  /** Features page hero — app capabilities background */
  featuresHero: '/images/home/story/features-hero.png',
  /** Daily utility category — phone mockup on features page */
  dailyUtilityPhone: '/images/features/daily-utility-phone.png',
  /** Garages & services category — phone mockup on features page */
  garagesServicesPhone: '/images/features/garages-services-phone.png',
  /** Safety & emergencies — features page dark section hero */
  safetyEmergenciesHero: '/images/features/safety-emergencies-hero.png',
  /** Multi-vehicle garage showcase — features page closing catalog */
  yourGarageDashboard: '/images/features/your-garage-dashboard.png',
  /** App screens collage — multi-vehicle, community placeholders */
  appScreensCollage: '/images/home/story/app-screens-collage.png',
  ecosystemWheel: '/images/home/story/ecosystem-wheel.png',
  /** Products page hero — phone hub + garage/parking/fuel/roadside/QR network */
  productsEcosystemHero: '/images/products/ecosystem-hero.png',
  /** Products Crash to care — phone + crash/family/QR callout cards */
  productsCrashToCare: '/images/products/crash-to-care.png',
  /** Products flagship app — phone + capability callouts with vehicles */
  productsFlagshipApp: '/images/products/flagship-app-v2.png',
  /** Products — Autolokate Partner garage dashboard */
  productsPartnerGarage: '/images/products/partner-garage.png',
  /** Products — Autolokate QR Partner parking/fuel dashboard */
  productsPartnerQr: '/images/products/partner-qr.png',

  /** Product photography */
  qrSticker: '/images/new-design/how-it-works/qr-sticker.png',

  /** Homepage hero media */
  heroVideo: '/videos/home/hero-scene.mp4?v=4',
  heroPoster: '/images/home/hero/intersection-calm.png',

  /** Homepage closing CTA — app onboarding mockup */
  closingProtectionApp: '/images/home/story/closing-protection-app.png',

  /** Pricing page hero — plan phone + Smart QR product shot */
  pricingHeroCover: '/images/pricing/pricing-hero-cover.png',
  /** Pricing Safe Start — retail pack + app phone composite */
  safeStartRetail: '/images/pricing/safe-start-retail.png',
} as const;
