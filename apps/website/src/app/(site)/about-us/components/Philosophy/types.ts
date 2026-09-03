export interface PhilosophyCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheading: string;
}

export type BeliefId = 'automatic' | 'backup' | 'privacy' | 'record';

export interface BeliefTile {
  id: BeliefId;
  title: string;
  body: string;
}
