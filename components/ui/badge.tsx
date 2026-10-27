import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-sky-600 text-white shadow hover:bg-sky-700",
        secondary:
          "border-transparent bg-teal-100 text-teal-800",
        destructive:
          "border-transparent bg-rose-100 text-rose-700",
        outline: "text-slate-700 border border-slate-200",
        pending: "border-amber-200 bg-amber-50 text-amber-700",
        confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
        completed: "border-sky-200 bg-sky-50 text-sky-700",
        cancelled: "border-rose-200 bg-rose-50 text-rose-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
