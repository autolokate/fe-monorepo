// Navigation Types
export type {
  NavigationSubItem,
  FeatureNavigation,
  NavigationItem,
  ActionButton,
  HeaderConfig,
  NavigationConfig,
  FeatureId,
  NavigationHelpers,
} from "./types";

// Navigation Configuration and Helpers
export {
  navigationConfig,
  getHeaderNavigationItems,
  getFooterNavigationItems,
  getNavigationById,
  getSubItemsByFeature,
  getAllSubItems,
  getHighlightedNavigationItems,
  hasSubItems,
  getExternalNavigationItems,
  getNavigationItemsByOrderRange,
  // Legacy exports for backward compatibility
  getNavigationItems,
} from "./config";

// Re-export for convenience
export { navigationConfig as default } from "./config";
