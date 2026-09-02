import type { CompositionPageId } from '../../types';
import { CompositionShowcase } from '../../components/CompositionShowcase';
import { BottomNavComposition } from '../../compositions/BottomNavComposition';
import { ContactCardComposition } from '../../compositions/ContactCardComposition';
import { EmptyContentComposition } from '../../compositions/EmptyContentComposition';
import { FormSectionComposition } from '../../compositions/FormSectionComposition';
import { PlanCardComposition } from '../../compositions/PlanCardComposition';
import { QuickActionRowComposition } from '../../compositions/QuickActionRowComposition';
import { StatusCardComposition } from '../../compositions/StatusCardComposition';
import { StepProgressComposition } from '../../compositions/StepProgressComposition';
import { VehicleInfoComposition } from '../../compositions/VehicleInfoComposition';
import { getCompositionMeta } from '../../compositions/metadata';

const compositionIssues: Partial<Record<CompositionPageId, string[]>> = {
  'composition-form-section': [
    'AlOtpInput shows 6 cells in code; Figma INPUTS row displays 6 cells with focus on cell 4 — aligned.',
  ],
};

function renderComposition(page: CompositionPageId) {
  switch (page) {
    case 'composition-form-section':
      return <FormSectionComposition />;
    case 'composition-vehicle-info':
      return <VehicleInfoComposition />;
    case 'composition-contact-card':
      return <ContactCardComposition />;
    case 'composition-quick-action-row':
      return <QuickActionRowComposition />;
    case 'composition-bottom-nav':
      return <BottomNavComposition />;
    case 'composition-status-card':
      return <StatusCardComposition />;
    case 'composition-empty-content':
      return <EmptyContentComposition />;
    case 'composition-step-progress':
      return <StepProgressComposition />;
    case 'composition-plan-card':
      return <PlanCardComposition />;
    default:
      return null;
  }
}

export function CompositionsPage({ page }: { page: CompositionPageId }) {
  const meta = getCompositionMeta(page);

  if (!meta) {
    return null;
  }

  return (
    <CompositionShowcase meta={meta} issues={compositionIssues[page] ?? []}>
      {renderComposition(page)}
    </CompositionShowcase>
  );
}
