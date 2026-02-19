"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-input border bg-background px-3 py-2 text-sm outline-none transition-colors",
        "border-border placeholder:text-muted-foreground",
        error && "border-error focus:border-error",
        !error && "focus:border-foreground focus:ring-1 focus:ring-foreground",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
