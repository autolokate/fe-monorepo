import { AppleGlyph, footerDownload, GooglePlayGlyph } from './constants';
import { FooterStoreBadge } from './FooterStoreBadge';
import styles from './footer.module.css';

export function FooterDownload() {
  return (
    <div className={styles.download}>
      <p className={styles.eyebrow}>{footerDownload.title}</p>
      <div className={styles.badges}>
        <FooterStoreBadge
          href={footerDownload.androidUrl}
          topLabel="Get it on"
          bottomLabel="Google Play"
          icon={<GooglePlayGlyph className="h-6 w-6" />}
        />
        <FooterStoreBadge
          href={footerDownload.iosUrl}
          topLabel="Download on the"
          bottomLabel="App Store"
          icon={<AppleGlyph className="h-6 w-6 text-white" />}
        />
      </div>
    </div>
  );
}
