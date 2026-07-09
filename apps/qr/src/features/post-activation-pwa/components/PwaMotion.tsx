import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Single screen fade — skips initial black frame on photo routes when `immediate`. */
export function PwaFade({
  children,
  className,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  immediate?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={immediate ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: immediate ? 0 : 0.22, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

/** Card press feedback — spring scale on tap. */
export function PwaSpringPress({ children, className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      className={className}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Status hero — subtle scale only (no opacity flash). */
export function PwaHeroReveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0.98 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.32, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

/** Footer — no delayed opacity fade (prevents CTA flash). */
export function PwaCtaReveal({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

/** Staggered section — translate only, no opacity (avoids double-fade with PwaFade). */
export function PwaRevealItem({
  children,
  className,
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ y: 8 }}
      animate={{ y: 0 }}
      transition={{
        duration: 0.28,
        ease: easeOut,
        delay: index * 0.05,
      }}
    >
      {children}
    </motion.div>
  );
}
