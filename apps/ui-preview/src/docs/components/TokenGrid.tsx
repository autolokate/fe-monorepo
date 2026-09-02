import type { ReactElement } from 'react';
import { AlHeading, AlText } from '@autolokate/ui';
import { motion, useReducedMotion } from 'framer-motion';

import { CopyButton } from './CopyButton';

export function TokenGrid({
  title,
  entries,
  preview,
}: {
  title: string;
  entries: Array<[string, string]>;
  preview: (token: string) => ReactElement;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      className="ds-card ds-card--showcase"
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
    >
      <AlHeading variant="h2">{title}</AlHeading>
      <div className="ds-token-grid">
        {entries.map(([token, value], index) => (
          <motion.div
            key={token}
            className="ds-token-item"
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.16, delay: Math.min(index * 0.01, 0.15) }
            }
          >
            <div className="ds-inline-between">
              <code>{token}</code>
              <CopyButton value={token} />
            </div>
            <AlText variant="mono">{value}</AlText>
            {preview(token)}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
