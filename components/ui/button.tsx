import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600",
        secondary: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-900",
        outline:
          "border border-slate-200 bg-white text-slate-900 hover:bg-neutral-50 focus-visible:outline-slate-900",
        ghost: "text-slate-700 hover:bg-neutral-100",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600"
      },
      size: {
        sm: "h-9 px-3 py-2",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-5 py-3"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, ...props },
  ref
) {
  return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});

export { buttonVariants };
