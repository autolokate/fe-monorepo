import Image from 'next/image';
import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';
import styles from './story-cinematic-visual.module.css';

type StorySurface = 'framed' | 'dark' | 'light' | 'full' | 'compact' | 'transparent' | 'phone';

interface StoryCinematicVisualProps {
  src: string;
  alt: string;
  priority?: boolean;
  /** framed = cinematic card · dark = flush on void · light = flush on stone */
  surface?: StorySurface;
}

export function StoryCinematicVisual({
  src,
  alt,
  priority = false,
  surface = 'dark',
}: StoryCinematicVisualProps) {
  const frameClass =
    surface === 'framed'
      ? styles.frame
      : surface === 'light'
        ? styles.frameLight
        : surface === 'full'
          ? styles.frameFull
          : surface === 'compact'
            ? styles.frameCompact
            : surface === 'transparent'
              ? styles.frameTransparent
              : surface === 'phone'
                ? styles.framePhone
                : styles.frameSeamless;

  return (
    <div className={frameClass}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        quality={90}
        sizes={
          surface === 'phone'
            ? '(min-width: 1024px) 18rem, 55vw'
            : surface === 'compact'
              ? '(min-width: 1024px) 56rem, 92vw'
              : surface === 'full'
                ? '100vw'
                : surface === 'transparent'
                  ? '(min-width: 1024px) 42rem, 92vw'
                  : '(min-width: 1024px) 45vw, 100vw'
        }
        className={styles.image}
      />
    </div>
  );
}

export function ProblemSceneVisual({ priority }: { priority?: boolean }) {
  return (
    <StoryCinematicVisual
      src={MARKETING_STORY_IMAGES.problemScene}
      alt="Night highway crash — damaged car on the shoulder, no one nearby to call for help"
      priority={priority}
      surface="light"
    />
  );
}

export function DetectionRadarVisual({ priority }: { priority?: boolean }) {
  return (
    <StoryCinematicVisual
      src={MARKETING_STORY_IMAGES.detectionRadar}
      alt="Autolokate app detecting severe impact and starting the emergency response sequence automatically"
      priority={priority}
      surface="phone"
    />
  );
}

export function ControlCenterVisual({
  surface,
  variant = 'operations',
  priority = false,
}: {
  surface?: StorySurface;
  variant?: 'operations' | 'coordinator';
  priority?: boolean;
}) {
  const src =
    variant === 'coordinator'
      ? MARKETING_STORY_IMAGES.controlCenterCoordinator
      : MARKETING_STORY_IMAGES.controlCenterCoordinates;

  const resolvedSurface = surface ?? (variant === 'coordinator' ? 'dark' : 'phone');

  return (
    <StoryCinematicVisual
      src={src}
      alt="Autolokate Control Center app — crash confirmed, live location tracked, and help dispatched from one place"
      priority={priority}
      surface={resolvedSurface}
    />
  );
}

export function ResponseHomeHubVisual() {
  return (
    <StoryCinematicVisual
      src={MARKETING_STORY_IMAGES.responseNetworkHome}
      alt="Autolokate connecting Control Center, ambulance, police, family, and roadside assistance from one hub"
      surface="compact"
    />
  );
}

export function ResponseHubVisual() {
  return (
    <StoryCinematicVisual
      src={MARKETING_STORY_IMAGES.responseNetworkCrash}
      alt="Autolokate accident detected — ambulance, police, and roadside help dispatched to a crash scene"
      surface="full"
    />
  );
}

export function SmartQrEcosystemVisual() {
  return (
    <StoryCinematicVisual
      src={MARKETING_STORY_IMAGES.smartQrEcosystem}
      alt="Autolokate Smart QR app — scan a vehicle sticker, no app or login required, help starts through Control Center"
      surface="phone"
    />
  );
}

export function EcosystemWheelVisual() {
  return (
    <StoryCinematicVisual
      src={MARKETING_STORY_IMAGES.ecosystemWheel}
      alt="Autolokate product ecosystem — apps, services, parking, maintenance, and roadside connected in one network"
      surface="dark"
    />
  );
}
