import { teamMetadata } from './config/metadata';
import { TeamClosingCta, TeamPhilosophy } from './components/TeamPhilosophy';
import { TeamGrid } from './components/TeamGrid';
import { TeamHero } from './components/TeamHero';

export const metadata = teamMetadata;

export default function TeamPage() {
  return (
    <main className="relative">
      <TeamHero />
      <TeamGrid />
      <TeamPhilosophy />
      <TeamClosingCta />
    </main>
  );
}
