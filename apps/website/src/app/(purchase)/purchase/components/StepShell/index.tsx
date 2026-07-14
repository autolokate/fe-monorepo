import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./index.module.css";

interface StepShellProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Optional back affordance shown above the title. */
  backLabel?: string;
  onBack?: () => void;
  /** Constrain the content column. Defaults to a comfortable form width. */
  width?: "sm" | "md" | "lg";
  align?: "start" | "center";
  children: ReactNode;
}

const WIDTHS: Record<NonNullable<StepShellProps["width"]>, string> = {
  sm: styles.widthSm,
  md: styles.widthMd,
  lg: styles.widthLg,
};

export function StepShell({
  title,
  subtitle,
  backLabel,
  onBack,
  width = "md",
  align = "start",
  children,
}: StepShellProps) {
  return (
    <div className={cn(styles.shell, WIDTHS[width], align === "center" && styles.center)}>
      {backLabel && onBack ? (
        <button type="button" onClick={onBack} className={styles.back}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {backLabel}
        </button>
      ) : null}

      <h1 className={cn(styles.title, "font-display")}>{title}</h1>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}

      <div className={styles.body}>{children}</div>
    </div>
  );
}
