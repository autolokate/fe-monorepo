import type { ReactNode } from 'react';

import type { AlScenePhotoCardProps } from '../ScenePhotoCard/ScenePhotoCard.types';

export type AlPhotoGridLayout = 'dual' | 'quad' | 'stacked' | 'review' | 'review-quad';

export type AlPhotoGridSlot = Pick<
  AlScenePhotoCardProps,
  'label' | 'state' | 'imageUrl' | 'onCapture' | 'icon' | 'variant'
> & { id: string };

export type AlPhotoGridReviewPhoto = {
  id: string;
  imageUrl?: string | null;
  /** Figma 1059:281 — tap rotate icon to replace photo */
  onRetake?: () => void;
  retakeLabel?: string;
};

export type AlPhotoGridProps = {
  layout: AlPhotoGridLayout;
  slots?: readonly AlPhotoGridSlot[];
  /** Figma 1044:2406 — review photo tiles */
  reviewPhotos?: readonly AlPhotoGridReviewPhoto[];
  /** Figma 1044:2422 — map preview label */
  locationLabel?: string;
  className?: string;
  /** Figma 847:278 — dashed location tile below photo slots */
  locationCapture?: {
    label: string;
    /** Coordinate or address line when location is captured */
    detail?: string;
    filled?: boolean;
    loading?: boolean;
    loadingLabel?: string;
    onCapture?: () => void;
  };
  /** @deprecated Use locationCapture */
  locationPreview?: ReactNode;
};
