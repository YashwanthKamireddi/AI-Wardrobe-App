
import { cva, type VariantProps } from 'class-variance-authority';

// Card variants for consistent styling
export const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      size: {
        sm: "p-3",
        md: "p-5",
        lg: "p-6",
      },
      interactive: {
        true: "hover:shadow-md hover:translate-y-[-2px] cursor-pointer",
      },
      variant: {
        default: "border-border",
        primary: "border-primary/20 bg-primary/5",
        secondary: "border-secondary/20 bg-secondary/5",
        accent: "border-accent/20 bg-accent/5",
      }
    },
    defaultVariants: {
      size: "md",
      interactive: false,
      variant: "default",
    }
  }
);

// Button variants with consistent animations
export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type CardVariantsProps = VariantProps<typeof cardVariants>;
export type ButtonVariantsProps = VariantProps<typeof buttonVariants>;
