import { AppleGlyph, footerDownload, GooglePlayGlyph } from './constants';
import { FooterStoreBadge } from './FooterStoreBadge';

export function FooterDownload() {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
        {footerDownload.title}
      </p>
      <div className="mt-4 mb-px flex flex-col items-start gap-2.5 sm:mb-0 sm:flex-row sm:flex-wrap sm:gap-3">
        <FooterStoreBadge
          href={footerDownload.androidUrl}
          topLabel="Get it on"
          bottomLabel="Google Play"
          icon={<GooglePlayGlyph className="h-6 w-6 sm:h-7 sm:w-7" />}
        />
        <FooterStoreBadge
          href={footerDownload.iosUrl}
          topLabel="Get it on"
          bottomLabel="App Store"
          icon={<AppleGlyph className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
        />
      </div>
    </div>
  );
}
