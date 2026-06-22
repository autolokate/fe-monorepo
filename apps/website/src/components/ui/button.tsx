import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-button text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 active:scale-[0.98] motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        /** Default = solid black CTA. */
        default:
          "border border-transparent bg-primary text-primary-foreground shadow-[0_6px_20px_-6px_rgba(15,23,42,0.25)] hover:bg-[color:var(--cta-hover)] hover:shadow-[0_10px_28px_-8px_rgba(15,23,42,0.32)]",
        primary:
          "border border-transparent bg-primary text-primary-foreground shadow-[0_6px_20px_-6px_rgba(15,23,42,0.25)] hover:bg-[color:var(--cta-hover)] hover:shadow-[0_10px_28px_-8px_rgba(15,23,42,0.32)]",
        destructive:
          "border border-transparent bg-destructive text-white shadow-sm hover:bg-[#dc2626]",
        /** Outline = transparent with a foreground border + label. */
        outline:
          "border border-foreground/80 bg-transparent text-foreground hover:bg-foreground/5 hover:border-foreground hover:text-foreground",
        secondary:
          "border border-border bg-card text-foreground hover:bg-muted/60",
        ghost:
          "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
        glass:
          "border border-border bg-card/70 text-foreground backdrop-blur-md hover:bg-card hover:border-foreground/30",
        cta: "border border-transparent bg-primary text-primary-foreground shadow-[0_6px_20px_-6px_rgba(15,23,42,0.25)] hover:bg-[color:var(--cta-hover)] hover:shadow-[0_10px_28px_-8px_rgba(15,23,42,0.32)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        /** Listing grids (catalogue + inventory) — soft surface. */
        listing:
          "border border-border bg-muted/40 font-semibold text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-muted/70 hover:border-foreground/25 hover:shadow-md active:bg-muted/85",
        /** Expert / book-expert flows — neutral solid CTA. */
        expert:
          "border border-transparent bg-primary text-primary-foreground shadow-md hover:bg-[color:var(--cta-hover)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-7 text-sm",
        icon: "h-9 w-9 rounded-button p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
