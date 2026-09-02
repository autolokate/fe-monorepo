import type { ReactNode } from 'react';
import styles from './process-steps.module.css';

export interface ProcessStep {
  id: string;
  label: string;
  title: string;
  body: ReactNode;
  tone?: 'default' | 'warn';
}

interface ProcessStepsProps {
  steps: ProcessStep[];
  className?: string;
}

export function ProcessSteps({ steps, className = '' }: ProcessStepsProps) {
  return (
    <ol className={`${styles.list} ${className}`}>
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={`${styles.step} ${step.tone === 'warn' ? styles.stepWarn : ''}`}
        >
          <span className={styles.label}>{step.label}</span>
          <div className={styles.copy}>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.body}>{step.body}</p>
          </div>
          {index < steps.length - 1 ? <span className={styles.divider} aria-hidden="true" /> : null}
        </li>
      ))}
    </ol>
  );
}
