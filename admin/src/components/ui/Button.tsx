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
        "rounded-[10px] h-[50px] min-h-[50px] px-4 text-[16px] font-normal transition-colors font-frame box-border",
        "border border-[rgba(16,16,16,0.25)]",
        variant === "primary" &&
          "bg-[#101010] text-white hover:opacity-90 disabled:bg-[rgba(16,16,16,0.25)] disabled:text-white disabled:cursor-not-allowed",
        variant === "secondary" &&
          "bg-white text-[#101010] hover:bg-[#F5F5F5]",
        variant === "ghost" && "bg-transparent text-[#101010] hover:bg-[#F5F5F5] border-transparent",
        className
      )}
      style={{ fontFamily: '"TT Firs Neue", sans-serif', lineHeight: "315%" }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
