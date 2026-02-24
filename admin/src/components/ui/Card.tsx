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
        "bg-white font-frame box-border",
        "rounded-[20px] border border-[rgba(16,16,16,0.15)]",
        className
      )}
      style={{
        boxSizing: "border-box",
        paddingTop: 20,
        paddingRight: 20,
        paddingBottom: 20,
        paddingLeft: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
