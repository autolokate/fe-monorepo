import { AlIcon } from '@autolokate/icons';
import {
  AlContainer,
  AlDivider,
  AlGrid,
  AlHeading,
  AlIconButton,
  AlStack,
  AlText,
} from '@autolokate/ui';

import {
  CoreComponentShowcase,
  type ShowcaseState,
} from '../../components/CoreComponentShowcase';
import type { CoreComponentPageId, PropRow } from '../../types';

function renderLayoutPreview(page: CoreComponentPageId, _state: ShowcaseState) {
  switch (page) {
    case 'core-text':
      return (
        <AlStack gap="sm">
          <AlText variant="display">Display</AlText>
          <AlText variant="body">Body text for paragraphs and descriptions.</AlText>
          <AlText variant="label" tone="muted">
            Label muted
          </AlText>
        </AlStack>
      );
    case 'core-heading':
      return (
        <AlStack gap="sm">
          <AlHeading variant="h1">Heading 1</AlHeading>
          <AlHeading variant="h2">Heading 2</AlHeading>
          <AlHeading variant="h3">Heading 3</AlHeading>
        </AlStack>
      );
    case 'core-stack':
      return (
        <AlStack gap="md">
          <AlText>Stack item 1</AlText>
          <AlText>Stack item 2</AlText>
          <AlText>Stack item 3</AlText>
        </AlStack>
      );
    case 'core-grid':
      return (
        <AlGrid columns={3} gap="sm">
          <AlText>Cell A</AlText>
          <AlText>Cell B</AlText>
          <AlText>Cell C</AlText>
        </AlGrid>
      );
    case 'core-container':
      return (
        <AlContainer>
          <AlText>Content within max-width container.</AlText>
        </AlContainer>
      );
    case 'core-divider':
      return (
        <AlStack gap="md">
          <AlText>Above divider</AlText>
          <AlDivider />
          <AlText>Below divider</AlText>
        </AlStack>
      );
    case 'core-icon-button':
      return (
        <AlIconButton icon={<AlIcon name="bell" size={20} />} label="Notifications" />
      );
    default:
      return null;
  }
}

function renderLayoutVariants(page: CoreComponentPageId) {
  switch (page) {
    case 'core-text':
      return (
        <AlStack gap="sm">
          <AlText variant="display">Display</AlText>
          <AlText variant="headline">Headline</AlText>
          <AlText variant="title">Title</AlText>
          <AlText variant="body">Body</AlText>
          <AlText variant="caption" tone="muted">
            Caption muted
          </AlText>
          <AlText variant="mono">Mono token</AlText>
        </AlStack>
      );
    case 'core-heading':
      return (
        <AlStack gap="sm">
          <AlHeading variant="h1">H1</AlHeading>
          <AlHeading variant="h2">H2</AlHeading>
          <AlHeading variant="h3">H3</AlHeading>
          <AlHeading variant="h4">H4</AlHeading>
        </AlStack>
      );
    case 'core-stack':
      return (
        <AlStack direction="row" gap="md" align="center">
          <AlText>Row</AlText>
          <AlText>layout</AlText>
          <AlText>variant</AlText>
        </AlStack>
      );
    case 'core-grid':
      return (
        <AlStack gap="md">
          <AlGrid columns={2} gap="sm">
            <AlText>2 col</AlText>
            <AlText>grid</AlText>
          </AlGrid>
          <AlGrid columns="auto" gap="sm">
            <AlText>Auto</AlText>
            <AlText>fit</AlText>
          </AlGrid>
        </AlStack>
      );
    case 'core-container':
      return (
        <AlStack gap="md">
          <AlContainer width="narrow">
            <AlText variant="caption">narrow</AlText>
          </AlContainer>
          <AlContainer width="wide">
            <AlText variant="caption">wide (default)</AlText>
          </AlContainer>
        </AlStack>
      );
    case 'core-divider':
      return (
        <AlStack direction="row" gap="md" align="center">
          <AlText>Left</AlText>
          <AlDivider orientation="vertical" />
          <AlText>Right</AlText>
        </AlStack>
      );
    case 'core-icon-button':
      return (
        <div className="preview-row">
          <AlIconButton size="sm" icon={<AlIcon name="bell" size={16} />} label="Small" />
          <AlIconButton icon={<AlIcon name="bell" size={20} />} label="Medium" />
          <AlIconButton size="lg" icon={<AlIcon name="bell" size={24} />} label="Large" />
          <AlIconButton filled icon={<AlIcon name="bell" size={20} />} label="Filled" />
        </div>
      );
    default:
      return null;
  }
}

const layoutMeta: Record<
  Extract<
    CoreComponentPageId,
    | 'core-text'
    | 'core-heading'
    | 'core-stack'
    | 'core-grid'
    | 'core-container'
    | 'core-divider'
    | 'core-icon-button'
  >,
  {
    name: string;
    description: string;
    whenToUse: string;
    overview: string;
    code: string;
    props: PropRow[];
    accessibility: string[];
  }
> = {
  'core-text': {
    name: 'AlText',
    description: 'Typography primitive with Figma text variants and tone tokens.',
    whenToUse: 'Body copy, labels, captions, and mono snippets within screens.',
    overview:
      'Maps to Figma text styles via variant prop. Supports semantic element override via as prop. Tone muted reduces contrast for secondary copy.',
    code: `import { AlText } from '@autolokate/ui';

<AlText variant="body">Body</AlText>
<AlText variant="label" tone="muted">Secondary</AlText>`,
    props: [
      { name: 'variant', type: 'TextVariant', defaultValue: 'body', description: 'display | headline | title | body | label | caption | mono' },
      { name: 'tone', type: 'TextTone', defaultValue: 'default', description: 'default | muted | on-primary' },
      { name: 'as', type: 'element', defaultValue: 'p', description: 'Semantic HTML element.' },
      { name: 'align', type: 'start | center', defaultValue: 'start', description: 'Text alignment.' },
    ],
    accessibility: [
      'Use semantic as prop for headings only when AlHeading is not appropriate.',
      'Muted tone still meets AA contrast on surface backgrounds.',
      'Long text wraps by default within parent width.',
    ],
  },
  'core-heading': {
    name: 'AlHeading',
    description: 'Semantic heading levels with design-system typography scale.',
    whenToUse: 'Page titles, section headers, and card headings.',
    overview:
      'Renders h1–h4 with matching visual scale. as and variant can diverge for accessible heading hierarchy.',
    code: `import { AlHeading } from '@autolokate/ui';

<AlHeading variant="h2">Section title</AlHeading>`,
    props: [
      { name: 'variant', type: 'AlHeadingVariant', defaultValue: 'h2', description: 'Visual scale h1–h4.' },
      { name: 'as', type: 'AlHeadingVariant', description: 'Semantic tag override.' },
    ],
    accessibility: [
      'Maintain logical heading order (h1 → h2 → h3) in page structure.',
      'Do not skip heading levels for styling — adjust variant instead.',
    ],
  },
  'core-stack': {
    name: 'AlStack',
    description: 'Flex layout primitive with tokenized gap, alignment, and direction.',
    whenToUse: 'Vertical or horizontal grouping with consistent spacing rhythm.',
    overview: 'Wraps flexbox with design-system gap tokens (xs through xxxl). Default column direction.',
    code: `import { AlStack, AlText } from '@autolokate/ui';

<AlStack gap="md"><AlText>A</AlText><AlText>B</AlText></AlStack>`,
    props: [
      { name: 'direction', type: 'row | column', defaultValue: 'column', description: 'Flex direction.' },
      { name: 'gap', type: 'StackGap', defaultValue: 'md', description: 'xs | sm | md | lg | xl | xxl | xxxl' },
      { name: 'align', type: 'start | center | stretch', defaultValue: 'stretch', description: 'Cross-axis alignment.' },
      { name: 'justify', type: 'start | center | between', defaultValue: 'start', description: 'Main-axis distribution.' },
    ],
    accessibility: [
      'Layout-only — no implicit ARIA roles.',
      'Use list semantics separately when stacking list items.',
    ],
  },
  'core-grid': {
    name: 'AlGrid',
    description: 'CSS grid layout with fixed column counts or auto-fit.',
    whenToUse: 'Multi-column field grids, tile rows, and responsive cell layouts.',
    overview: 'Column counts 1–4 or auto. Gap uses same StackGap token scale.',
    code: `import { AlGrid } from '@autolokate/ui';

<AlGrid columns={3} gap="md">{children}</AlGrid>`,
    props: [
      { name: 'columns', type: 'GridColumns', defaultValue: '1', description: '1 | 2 | 3 | 4 | auto' },
      { name: 'gap', type: 'StackGap', defaultValue: 'md', description: 'Grid gap token.' },
    ],
    accessibility: [
      'Grid is presentational — ensure reading order matches DOM order.',
      'On narrow viewports, consider single-column fallback at screen level.',
    ],
  },
  'core-container': {
    name: 'AlContainer',
    description: 'Max-width content wrapper with horizontal padding.',
    whenToUse: 'Centering screen content within mobile and tablet breakpoints.',
    overview: 'Width variants: narrow, wide (default), full. Applies horizontal padding from layout tokens.',
    code: `import { AlContainer } from '@autolokate/ui';

<AlContainer>{children}</AlContainer>`,
    props: [
      { name: 'width', type: 'ContainerWidth', defaultValue: 'wide', description: 'narrow | wide | full' },
    ],
    accessibility: [
      'Does not constrain focus order or skip links.',
      'Full-width variant for edge-to-edge media only.',
    ],
  },
  'core-divider': {
    name: 'AlDivider',
    description: 'Separator rule using outline token — horizontal or vertical.',
    whenToUse: 'Visual separation between sections, list groups, or inline content.',
    overview: 'Renders hr with role="separator". Uses --al-color-outline.',
    code: `import { AlDivider } from '@autolokate/ui';

<AlDivider />
<AlDivider orientation="vertical" />`,
    props: [
      { name: 'orientation', type: 'horizontal | vertical', defaultValue: 'horizontal', description: 'Separator direction.' },
    ],
    accessibility: [
      'role="separator" on hr element.',
      'Decorative only — do not rely on divider for semantic section boundaries.',
    ],
  },
  'core-icon-button': {
    name: 'AlIconButton',
    description: 'Icon-only button with required accessible name.',
    whenToUse: 'Toolbar actions, header icons, and compact controls.',
    overview: 'Requires label prop mapped to aria-label and title. Sizes sm/md/lg with optional filled variant.',
    code: `import { AlIconButton } from '@autolokate/ui';
import { AlIcon } from '@autolokate/icons';

<AlIconButton icon={<AlIcon name="bell" />} label="Notifications" />`,
    props: [
      { name: 'icon', type: 'ReactNode', description: 'Icon content (mark aria-hidden on AlIcon).' },
      { name: 'label', type: 'string', description: 'Required — aria-label and title.' },
      { name: 'size', type: 'sm | md | lg', defaultValue: 'md', description: 'Touch target size.' },
      { name: 'filled', type: 'boolean', defaultValue: 'false', description: 'Filled surface variant.' },
    ],
    accessibility: [
      'label prop is required — never ship icon-only buttons without accessible name.',
      'md/lg sizes meet 48dp minimum touch target.',
      'Icon span marked aria-hidden; label carries meaning.',
    ],
  },
};

export function LayoutComponentPage({ page }: { page: keyof typeof layoutMeta }) {
  const meta = layoutMeta[page];

  return (
    <CoreComponentShowcase
      name={meta.name}
      description={meta.description}
      whenToUse={meta.whenToUse}
      whenNotToUse="Do not use layout primitives for interactive semantics — pair with appropriate controls."
      overview={<p>{meta.overview}</p>}
      variants={renderLayoutVariants(page)}
      renderStatePreview={(state) => renderLayoutPreview(page, state)}
      responsive={renderLayoutPreview(page, 'default')}
      accessibility={
        <ul className="ds-list">
          {meta.accessibility.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      }
      usage={renderLayoutPreview(page, 'default')}
      code={meta.code}
      props={meta.props}
    />
  );
}
