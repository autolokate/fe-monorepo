// import { homeNavigation } from "@/app/home-old/config/navigation";
// import { mentorsNavigation } from "@/app/explore-mentors/config/navigation";

import type {
  FeatureNavigation,
  NavigationConfig,
  FeatureId,
  NavigationSubItem,
} from "./types";

/**
 * Main navigation configuration
 * Contains all feature navigation items
 */
export const navigationConfig: NavigationConfig = [
  // homeNavigation,
  // mentorsNavigation,

];

/**
 * Navigation Helper Functions
 */

/**
 * Get navigation items for header display (filtered and sorted)
 */
export const getHeaderNavigationItems = (): FeatureNavigation[] => {
  return navigationConfig
    .filter((item) => item.showInHeader)
    .sort((a, b) => a.order - b.order);
};

/**
 * Get navigation items for footer display (filtered and sorted)
 */
export const getFooterNavigationItems = (): FeatureNavigation[] => {
  return navigationConfig
    .filter((item) => item.showInFooter)
    .sort((a, b) => a.order - b.order);
};

/**
 * Get a specific navigation item by its ID
 */
export const getNavigationById = (
  id: FeatureId
): FeatureNavigation | undefined => {
  return navigationConfig.find((item) => item.id === id);
};

/**
 * Get sub-items for a specific feature
 */
export const getSubItemsByFeature = (id: FeatureId): NavigationSubItem[] => {
  const feature = getNavigationById(id);
  return feature?.subItems || [];
};

/**
 * Get all sub-items across all features (useful for search/sitemap)
 */
export const getAllSubItems = (): NavigationSubItem[] => {
  return navigationConfig.reduce<NavigationSubItem[]>((acc, item) => {
    if (item.subItems) {
      acc.push(...item.subItems);
    }
    return acc;
  }, []);
};

/**
 * Get highlighted navigation items (like premium features)
 */
export const getHighlightedNavigationItems = (): FeatureNavigation[] => {
  return navigationConfig.filter((item) => item.isHighlighted);
};

/**
 * Check if a feature has sub-items
 */
export const hasSubItems = (id: FeatureId): boolean => {
  const feature = getNavigationById(id);
  return Boolean(feature?.subItems && feature.subItems.length > 0);
};

/**
 * Get external navigation items
 */
export const getExternalNavigationItems = (): FeatureNavigation[] => {
  return navigationConfig.filter((item) => item.external);
};

/**
 * Get navigation items by order range
 */
export const getNavigationItemsByOrderRange = (
  min: number,
  max: number
): FeatureNavigation[] => {
  return navigationConfig.filter(
    (item) => item.order >= min && item.order <= max
  );
};

// Legacy function names for backward compatibility
export const getNavigationItems = getHeaderNavigationItems;
