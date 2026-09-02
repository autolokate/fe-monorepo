'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { SMART_QR_PHONE_IMAGE } from './constants';
import styles from './phone-stage.module.css';

interface SmartQrPhoneStageProps {
  activeIndex: number;
}

export function SmartQrPhoneStage({ activeIndex }: SmartQrPhoneStageProps) {
  return (
    <div
      className={styles.stage}
      style={{ '--active-step': activeIndex } as CSSProperties}
      aria-hidden="true"
    >
      <div className={styles.glow} />
      <div className={styles.scanRing} />
      <div className={styles.phoneShell}>
        <Image
          src={SMART_QR_PHONE_IMAGE}
          alt=""
          width={480}
          height={960}
          className={styles.phoneImage}
          priority={false}
        />
        <span
          className={[styles.overlay, styles.scanOverlay, activeIndex === 0 ? styles.overlayOn : '']
            .filter(Boolean)
            .join(' ')}
        />
        <span
          className={[
            styles.overlay,
            styles.emergencyOverlay,
            activeIndex === 1 ? styles.overlayOn : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        <span
          className={[styles.overlay, styles.parkOverlay, activeIndex === 2 ? styles.overlayOn : '']
            .filter(Boolean)
            .join(' ')}
        />
        <span
          className={[styles.scanBeam, activeIndex === 0 ? styles.beamOn : '']
            .filter(Boolean)
            .join(' ')}
        />
      </div>
      <div className={styles.stepChips}>
        <span
          className={[styles.chip, activeIndex === 0 ? styles.chipOn : '']
            .filter(Boolean)
            .join(' ')}
        >
          Scan
        </span>
        <span
          className={[styles.chip, activeIndex === 1 ? styles.chipOn : '']
            .filter(Boolean)
            .join(' ')}
        >
          Emergency
        </span>
        <span
          className={[styles.chip, activeIndex === 2 ? styles.chipOn : '']
            .filter(Boolean)
            .join(' ')}
        >
          Park Me
        </span>
      </div>
    </div>
  );
}
