import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-copper text-cream hover:bg-copper-deep",
        pine: "bg-pine text-cream hover:bg-pine-soft",
        quiet: "bg-cream text-ink shadow-card hover:shadow-card-hover",
        ghost: "bg-transparent text-ink hover:bg-cream",
        line: "border border-line bg-transparent text-ink hover:bg-cream",
      },
      size: {
        md: "h-11 px-4 text-sm",
        sm: "h-11 px-3 text-sm",
        lg: "h-12 px-5 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: Props) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
