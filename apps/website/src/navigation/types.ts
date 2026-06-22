export interface NavigationSubItem {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
  icon?: string;
}

export interface FeatureNavigation {
  id: string;
  label: string;
  href: string;
  order: number;
  showInHeader: boolean;
  showInFooter: boolean;
  isHighlighted?: boolean;
  external?: boolean;
  subItems?: NavigationSubItem[];
}

// Legacy interfaces for backward compatibility
export interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface ActionButton {
  label: string;
  href: string;
  variant: "primary" | "secondary";
  icon?: string;
  iconAlt?: string;
  external?: boolean;
}

export interface HeaderConfig {
  navigationItems: NavigationItem[];
  actionButtons: ActionButton[];
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
}

// Core navigation types
export type NavigationConfig = FeatureNavigation[];
export type FeatureId =
  | "home"
  | "explore-mentors"
  | "book-session"
  | "community"
  | "explore-premium";

// Helper interface for navigation utilities
export interface NavigationHelpers {
  getNavigationItems: () => FeatureNavigation[];
  getFooterNavigationItems: () => FeatureNavigation[];
  getNavigationById: (id: FeatureId) => FeatureNavigation | undefined;
  getSubItemsByFeature: (id: FeatureId) => NavigationSubItem[];
  getAllSubItems: () => NavigationSubItem[];
  getHighlightedNavigationItems: () => FeatureNavigation[];
  hasSubItems: (id: FeatureId) => boolean;
}
