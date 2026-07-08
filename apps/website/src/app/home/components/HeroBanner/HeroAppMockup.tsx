"use client";

import { useEffect, useState } from "react";
import { Ambulance, Check, MapPin, User, Users, Wifi } from "lucide-react";
import styles from "./index.module.css";

const DISPATCHED = [
  { Icon: Ambulance, title: "Ambulance routed", sub: "ETA 6 min" },
  { Icon: Users, title: "Priya & Dad notified", sub: "" },
  { Icon: MapPin, title: "Live location shared", sub: "" },
] as const;

type Mode = "monitor" | "impact" | "count" | "safe";

/**
 * Animated "app" preview that mirrors a full Autolokate crash detection,
 * start to finish. Cycles every second: drive mode → impact → countdown →
 * help on the way.
 */
export function HeroAppMockup() {
  const [t, setT] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setT((s) => (s + 1) % 10), 1000);
    return () => clearInterval(timer);
  }, []);

  let mode: Mode = "monitor";
  let countNum = "";
  if (t < 2) mode = "monitor";
  else if (t === 2) mode = "impact";
  else if (t >= 3 && t <= 7) {
    mode = "count";
    countNum = String(8 - t);
  } else mode = "safe";

  return (
    <div className={styles.mockupStack} aria-hidden="true">
      <div className={styles.device}>
        <div className={styles.deviceScreen} data-mode={mode}>
          <span className={styles.dynamicIsland} />

          <div className={styles.statusBar}>
            <span className={styles.statusTime}>9:41</span>
            <span className={styles.statusIcons}>
              <span className={styles.signal}>
                <i />
                <i />
                <i />
                <i />
              </span>
              <Wifi className="h-3.5 w-3.5" strokeWidth={2.5} />
              <span className={styles.battery}>
                <span className={styles.batteryFill} />
              </span>
            </span>
          </div>

          <div className={styles.appHeader}>
            <div className={styles.brand}>
              <span className={styles.logoMark}>A</span>
              <span className={styles.wordmark}>AUTOLOKATE</span>
            </div>
            <span className={styles.profile}>
              <User className="h-4 w-4" />
            </span>
          </div>

          {mode === "monitor" && (
            <div className={styles.stateWrap} style={{ gap: "24px" }}>
              <div className={styles.driveMode}>
                <span className={styles.liveDot} />
                DRIVE MODE
              </div>
              <div className={styles.radar}>
                <span className={styles.radarRing} />
                <span className={styles.radarRing} style={{ animationDelay: "1.2s" }} />
                <span className={styles.radarCore}>62</span>
              </div>
              <div>
                <div className={styles.stateTitle}>Watching your drive</div>
                <div className={styles.stateSub}>Impact · location · route</div>
              </div>
            </div>
          )}

          {mode === "impact" && (
            <div className={styles.stateWrap} style={{ gap: "20px" }}>
              <div className={styles.impactCircle}>!</div>
              <div>
                <div className={styles.impactTitle}>
                  Severe impact
                  <br />
                  detected
                </div>
                <div className={styles.dangerSub}>Hold tight — getting you help</div>
              </div>
            </div>
          )}

          {mode === "count" && (
            <div className={styles.stateWrap} style={{ gap: "18px" }}>
              <div className={styles.countLabel}>CALLING FOR HELP IN</div>
              <div className={styles.countCircle}>
                <span>{countNum}</span>
              </div>
              <div className={styles.countSub}>
                Notifying family &amp; dispatching an ambulance
              </div>
              <div className={styles.cancelBtn}>I&apos;m OK — Cancel</div>
            </div>
          )}

          {mode === "safe" && (
            <div className={styles.stateWrap} style={{ gap: "16px" }}>
              <div className={styles.safeCircle}>
                <Check className="h-9 w-9" strokeWidth={3} />
              </div>
              <div className={styles.safeTitle}>Help is on the way</div>
              <div className={styles.dispatchList}>
                {DISPATCHED.map(({ Icon, title, sub }) => (
                  <div key={title} className={styles.dispatchItem}>
                    <span className={styles.dispatchDot} />
                    <span className={styles.dispatchIcon}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className={styles.dispatchText}>
                      <span className={styles.dispatchTitle}>{title}</span>
                      {sub ? <span className={styles.dispatchSub}>{sub}</span> : null}
                    </span>
                  </div>
                ))}
              </div>
              <p className={styles.footerNote}>
                We&apos;ll keep watching your drive and update you automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
