import {
  FeaturesClosing,
  FeaturesHero,
  SafetyChapters,
  UtilityBands,
} from './components/FeaturesContent';
import { featuresMetadata } from './config/metadata';

export const metadata = featuresMetadata;

export default function FeaturesPage() {
  return (
    <main className="relative">
      <FeaturesHero />
      <SafetyChapters />
      <UtilityBands />
      <FeaturesClosing />
    </main>
  );
}
