export interface PolicyParagraph {
  /** Optional sub-heading rendered above the body. */
  heading?: string;
  /** Single paragraph of body text. */
  body?: string;
  /** Optional bullet list rendered after the body. */
  bullets?: string[];
  /** Optional label/value rows for contact-style sections. */
  rows?: { label: string; value: string }[];
}

export interface PolicySection {
  /** Numeric prefix shown in the eyebrow and ToC ("1", "14.2" etc). */
  number: string;
  /** Stable slug used for the in-page anchor. */
  id: string;
  /** Section title (without the numeric prefix). */
  title: string;
  /** One-line description rendered under the title. */
  intro?: string;
  /** Ordered list of sub-blocks. Most sections have a single block. */
  blocks: PolicyParagraph[];
}

export interface PolicyTocEntry {
  number: string;
  id: string;
  title: string;
}
