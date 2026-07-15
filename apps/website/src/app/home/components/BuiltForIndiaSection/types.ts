import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

export interface BuiltForIndiaCard {
  title: string;
  body: string;
  Icon: ComponentType<LucideProps>;
}

export interface BuiltForIndiaCopy {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  subheadingLine1: string;
  subheadingLine2: string;
}
