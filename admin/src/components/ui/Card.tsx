"use client";

import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-border bg-white p-5 shadow-card font-frame",
        "border-[rgba(16,16,16,0.1)]",
        className
      )}
      style={{ boxSizing: "border-box", ...style }}
    >
      {children}
    </div>
  );
}
