import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand-500 text-white hover:bg-brand-600",
        secondary: "bg-surface-1 text-ink-primary border border-border hover:bg-surface-0",
        outline: "border border-border bg-transparent hover:bg-surface-0",
        success: "bg-status-paid text-white hover:opacity-90",
        danger: "bg-status-overdue text-white hover:opacity-90",
        ghost: "hover:bg-surface-0 text-ink-secondary",
        whatsapp: "bg-[#25D366] text-white hover:opacity-90",
      },
      size: {
        default: "h-11 px-4 py-2",
        lg: "h-14 px-6 text-base",
        sm: "h-9 px-3 text-xs",
        icon: "h-11 w-11 shrink-0",
      },
    },
    defaultVariants: { variant: "secondary", size: "default" },
  }
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
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
