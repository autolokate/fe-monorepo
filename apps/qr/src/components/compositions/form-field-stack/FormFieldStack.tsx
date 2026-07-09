import type { ReactNode } from 'react';

import '../validation-feedback/validation-feedback.css';

export type FormFieldStackProps = {
  children: ReactNode;
  className?: string;
};

export function FormFieldStack({ children, className }: FormFieldStackProps) {
  return <div className={className ? `ob-field-stack ${className}` : 'ob-field-stack'}>{children}</div>;
}
