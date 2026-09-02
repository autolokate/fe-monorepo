import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';

export const FEATURES_HERO = {
  eyebrow: 'The Autolokate app',
  headline: 'Everything your vehicle',
  headlineLine2: 'needs. One app.',
  body: 'Challans, crash detection, garages, driver score, Smart QR, and every car you own—handled from one place.',
  image: MARKETING_STORY_IMAGES.featuresHero,
  imageAlt: 'Autolokate app — vehicle management, safety, and everyday tools',
  primaryCta: { label: 'Browse features', href: '#features' },
  secondaryCta: { label: 'View plans', href: '/pricing' },
} as const;

export const FEATURES_HERO_STATS = [
  { value: '29+', label: 'Features' },
  { value: '7', label: 'Categories' },
  { value: 'Free', label: 'To install' },
] as const;

export const FEATURES_CATALOG_COPY = {
  eyebrow: 'Full feature list',
  headline: 'Every capability,',
  headlineAccent: 'in one place.',
  subheading: 'Organized by what you use—scroll or jump to a category.',
} as const;

export const FEATURES_DAILY_UTILITY_MEDIA = {
  image: MARKETING_STORY_IMAGES.dailyUtilityPhone,
  imageAlt:
    'Autolokate daily utility — challans, FASTag, renewal alerts, parking memory, and phone dashcam',
} as const;

export const FEATURES_GARAGES_MEDIA = {
  image: MARKETING_STORY_IMAGES.garagesServicesPhone,
  imageAlt:
    'Autolokate garages and services — verified garages, mod shops, booking history, and service history on QR',
} as const;

export const FEATURES_SHOWCASES = [
  {
    id: 'garage',
    eyebrow: 'Your garage',
    headline: 'Every vehicle. One dashboard.',
    body: 'Switch between cars and bikes instantly. Track plans, contacts, service history, and everyday tasks from a single login.',
    image: MARKETING_STORY_IMAGES.yourGarageDashboard,
    imageAlt:
      'Autolokate multi-vehicle garage — switch between cars and bikes, track plans, service history, and everyday tasks from one dashboard',
  },
] as const;

export const FEATURES_SAFETY_DARK = {
  eyebrow: 'Safety & emergencies',
  headline: 'Built for the moment',
  headlineAccent: 'you cannot call.',
  body: 'Crash detection, Control Center coordination, family alerts, ambulance dispatch, hospital cover, Smart QR, and roadside help—designed to run without you reaching for your phone.',
  image: MARKETING_STORY_IMAGES.safetyEmergenciesHero,
  imageAlt:
    'Autolokate safety and emergencies — crash detection, Control Center, family alerts, ambulance dispatch, hospital cover, Smart QR, and roadside help',
  cta: { label: 'How it works', href: '/how-it-works' },
} as const;

export const FEATURES_CLOSING = {
  headline: 'Download free.',
  headlineAccent: 'Upgrade when ready.',
  subheading:
    'The app costs nothing to install. Add a protection plan per vehicle when you want crash detection and cover activated.',
  primaryCta: { label: 'Get protected', href: '/buy' },
  secondaryCta: { label: 'See pricing', href: '/pricing' },
} as const;
