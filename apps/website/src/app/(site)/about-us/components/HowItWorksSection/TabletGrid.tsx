import type { CrashToCareStep } from "./types";
import { StepCard } from "./StepCard";

interface TabletGridProps {
  steps: CrashToCareStep[];
}

export function TabletGrid({ steps }: TabletGridProps) {
  return (
    <ol className="mx-auto grid max-w-xl list-none grid-cols-2 gap-4">
      {steps.map((step) => (
        <li key={step.id} className="min-w-0">
          <StepCard step={step} className="mx-auto w-full max-w-[260px] lg:w-full" />
        </li>
      ))}
    </ol>
  );
}
