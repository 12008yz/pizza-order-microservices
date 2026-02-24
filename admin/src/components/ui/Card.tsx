"use client";

import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-border bg-white p-5 shadow-card font-frame",
        "border-[rgba(16,16,16,0.1)]",
        className
      )}
      style={{ boxSizing: "border-box" }}
    >
      {children}
    </div>
  );
}
