/** Logo variant for background context. */
export type BrandVariant = 'light' | 'dark';

export type BrandLogoProps = {
  /** Render width in pixels (height scales from viewBox aspect ratio). */
  size?: number | string;
  className?: string;
  'aria-label'?: string;
  /** `light` = dark logo for light backgrounds. `dark` = light logo for dark backgrounds. */
  variant?: BrandVariant;
};
export type AlBrandLogoProps = BrandLogoProps;

export const BRAND_BLACK = '#0A0A0A';
export const BRAND_WHITE = '#FFFFFF';

export const LOGO_VIEW_BOX = '155 170 717 687';
export const LOGO_ASPECT_RATIO = 717 / 687;
export const MARK_VIEW_BOX = '155 170 717 687';

export function getBrandFill(variant: BrandVariant): string {
  return variant === 'light' ? BRAND_BLACK : BRAND_WHITE;
}
