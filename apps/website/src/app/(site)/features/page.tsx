import {
  FeaturesCatalog,
  FeaturesClosing,
  FeaturesHero,
  FeaturesJumpNav,
  FeaturesSafetyDark,
} from './components/FeaturesContent';
import { featuresMetadata } from './config/metadata';

export const metadata = featuresMetadata;

export default function FeaturesPage() {
  return (
    <>
      <FeaturesHero />
      <FeaturesJumpNav />
      <FeaturesCatalog part="intro" />
      <FeaturesSafetyDark />
      <FeaturesCatalog part="rest" />
      <FeaturesClosing />
    </>
  );
}
