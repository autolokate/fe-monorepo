export interface CompareColumn {
  id: string;
  name: string;
  price: string;
  popular?: boolean;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface CompareRow {
  id: string;
  label: string;
  /** One boolean per column, in the same order as `COMPARE_COLUMNS`. */
  cells: boolean[];
}

export interface CompareGroup {
  id: string;
  title: string;
  rows: CompareRow[];
}

export interface CompareCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheading: string;
  handoff: string;
  handoffLink: {
    label: string;
    href: string;
  };
}
