import { Fragment } from "react";
import { cn } from "@/lib/utils";
import type { CrashToCareStep } from "./types";
import { StepArrow } from "./StepArrow";
import { StepCard } from "./StepCard";

interface FlowRowProps {
  steps: CrashToCareStep[];
  className?: string;
}

export function FlowRow({ steps, className }: FlowRowProps) {
  return (
    <ol
      className={cn(
        "flex list-none flex-wrap items-center justify-center gap-y-3",
        className,
      )}
    >
      {steps.map((step, index) => (
        <Fragment key={step.id}>
          <li>
            <StepCard step={step} />
          </li>
          {index < steps.length - 1 ? (
            <li className="flex list-none items-center">
              <StepArrow />
            </li>
          ) : null}
        </Fragment>
      ))}
    </ol>
  );
}
