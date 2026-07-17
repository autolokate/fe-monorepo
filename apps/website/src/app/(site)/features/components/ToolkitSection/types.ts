import type { LucideIcon } from 'lucide-react';

export interface ToolkitCopy {
  eyebrow: string;
  headlineAccent: string;
  headline: string;
  subheading: string;
}

export interface Capability {
  id: string;
  label: string;
  detail: string;
  Icon: LucideIcon;
}

export type TileWidth = 'wide' | 'default';

export interface ToolkitTile {
  id: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  width: TileWidth;
  /** Number of columns the capability list is split into. */
  capabilityColumns: 1 | 2;
  capabilities: Capability[];
}

export type RowLayout = 'wide' | 'three' | 'two';

export interface ToolkitRow {
  id: string;
  layout: RowLayout;
  tiles: ToolkitTile[];
}
