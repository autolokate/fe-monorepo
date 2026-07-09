import type { AlIconName } from '@autolokate/icons';
import type { DocPageId } from '../docs/types';
export type { DocPageId } from '../docs/types';

export type DocNavGroupId =
  | 'overview'
  | 'foundations'
  | 'brand'
  | 'icons'
  | 'core-buttons'
  | 'core-inputs'
  | 'core-selection'
  | 'core-navigation'
  | 'core-display'
  | 'core-progress'
  | 'core-layout'
  | 'admin'
  | 'composition-validation';

export type DocNavItem = {
  id: DocPageId;
  label: string;
  icon: AlIconName;
};

export type DocNavGroup = {
  id: DocNavGroupId;
  label: string;
  items: DocNavItem[];
};
