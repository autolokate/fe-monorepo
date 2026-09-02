'use client';

import { BRAND_LOGO } from '@/lib/brand-logos';
import styles from './incident-phone-mockup.module.css';

export type PhoneMockupState = 'monitoring' | 'crash' | 'detecting' | 'connecting' | 'control';

interface IncidentPhoneMockupProps {
  state: PhoneMockupState;
  connectedCount?: number;
  className?: string;
}

const CONNECT_LABELS = ['Family', 'Ambulance', 'Police', 'Roadside', 'Control'];

export function IncidentPhoneMockup({
  state,
  connectedCount = 0,
  className,
}: IncidentPhoneMockupProps) {
  const isAlert = state === 'crash' || state === 'detecting';
  const isConnecting = state === 'connecting';
  const isControl = state === 'control';

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')} aria-hidden="true">
      <div className={styles.device}>
        <div className={styles.notch} />
        <div className={`${styles.screen} ${isAlert ? styles.screenAlert : ''}`}>
          <div className={styles.statusBar}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BRAND_LOGO.onDarkBg} alt="" className={styles.statusMark} />
            <span className={styles.statusText}>
              {isAlert ? 'Impact detected' : isControl ? 'Control Center live' : "You're protected"}
            </span>
            <span className={styles.live}>
              <span className={styles.liveDot} />
              LIVE
            </span>
          </div>

          <div className={styles.map}>
            <div className={styles.mapGrid} />
            <div className={styles.road} />
            <div className={`${styles.car} ${isAlert ? styles.carStopped : styles.carMoving}`} />
            {(isAlert || isConnecting) && <div className={styles.impactRing} />}
            {(isConnecting || isControl) && (
              <div className={styles.radar}>
                <span />
                <span />
              </div>
            )}
          </div>

          {isAlert ? (
            <div className={styles.alertCard}>
              <p className={styles.alertTitle}>Severe impact detected</p>
              <p className={styles.alertSub}>NH48, Pune · Alerts starting in 28s</p>
            </div>
          ) : null}

          {isConnecting ? (
            <div className={styles.connectPanel}>
              <p className={styles.connectTitle}>Activating response network</p>
              <ul className={styles.connectList}>
                {CONNECT_LABELS.map((label, index) => (
                  <li
                    key={label}
                    className={`${styles.connectItem} ${index < connectedCount ? styles.connectItemOn : ''}`}
                  >
                    <span className={styles.connectDot} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {isControl ? (
            <div className={styles.controlCard}>
              <p className={styles.controlEyebrow}>Control Center</p>
              <p className={styles.controlTitle}>Ambulance on the way</p>
              <p className={styles.controlSub}>Family notified · ETA 7 min</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
