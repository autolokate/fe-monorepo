import { useState } from 'react';
import { AlIcon } from '@autolokate/icons';
import { AlGrid, AlHeading, AlStack, AlText } from '@autolokate/ui';
import { motion, useReducedMotion } from 'framer-motion';

import { CopyButton } from '../components/CopyButton';
import { figmaIcons, iconSizes, isIconSize, type IconSize } from '../data';

export function IconsPage() {
  const prefersReducedMotion = useReducedMotion();
  const [size, setSize] = useState<IconSize>('24');

  return (
    <AlStack gap="lg">
      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h2">Figma icon gallery</AlHeading>
        <AlText tone="muted">
          {figmaIcons.length} icons from Autolokate Consumer App Foundations &amp; Components.
        </AlText>
        <div className="preview-row">
          {iconSizes.map((option) => (
            <button
              key={option}
              type="button"
              className={`ds-search-result${size === option ? ' is-active' : ''}`}
              onClick={() => {
                if (isIconSize(option)) {
                  setSize(option);
                }
              }}
            >
              {option}px
            </button>
          ))}
        </div>
      </section>

      <section className="ds-card ds-card--showcase">
        <AlGrid columns={4} gap="md">
          {figmaIcons.map((icon) => (
            <motion.div
              key={`${icon}-${size}`}
              className="ds-icon-cell"
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
              whileHover={prefersReducedMotion ? undefined : { y: -2 }}
            >
              <AlIcon name={icon} size={Number(size)} />
              <AlText variant="label">{icon}</AlText>
              <CopyButton value={`<AlIcon name="${icon}" size={${size}} />`} />
            </motion.div>
          ))}
        </AlGrid>
      </section>
    </AlStack>
  );
}
