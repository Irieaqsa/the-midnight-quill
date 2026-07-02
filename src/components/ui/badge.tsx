import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 hover:shadow-sm",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/70",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border/60 hover:border-ink hover:text-ink hover:bg-ink/5",
        ink: "border-transparent bg-ink/10 text-ink hover:bg-ink/20",
        coral: "border-transparent bg-coral/10 text-coral hover:bg-coral/20",
        amber: "border-transparent bg-amber/10 text-amber hover:bg-amber/20",
        sage: "border-transparent bg-sage/10 text-sage hover:bg-sage/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
