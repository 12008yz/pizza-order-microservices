"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-input px-4 py-2 text-sm font-medium transition-colors",
        variant === "primary" &&
          "bg-foreground text-background hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
        variant === "secondary" &&
          "border border-border bg-muted text-foreground hover:bg-border",
        variant === "ghost" && "hover:bg-muted text-foreground",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
