import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-white border border-surface-3 shadow-soft rounded-2xl",
      elevated: "bg-white shadow-elevated rounded-2xl",
      outlined: "bg-transparent border border-surface-3 rounded-2xl",
    };

    return (
      <div ref={ref} className={cn(variants[variant], className)} {...props} />
    );
  }
);

Card.displayName = "Card";
export default Card;
