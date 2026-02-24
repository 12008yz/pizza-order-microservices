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
        "w-full h-[50px] min-h-[50px] rounded-[10px] border bg-white outline-none transition-colors font-frame",
        "pl-[15px] pr-[16px] text-[16px] leading-[125%] box-border",
        "border-[rgba(16,16,16,0.25)] placeholder:text-[rgba(16,16,16,0.5)]",
        "focus:border-[rgba(16,16,16,0.5)]",
        error && "border-error focus:border-error",
        className
      )}
      style={{ fontFamily: '"TT Firs Neue", sans-serif' }}
      {...props}
    />
  )
);
Input.displayName = "Input";
