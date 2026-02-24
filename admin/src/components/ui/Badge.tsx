"use client";

import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const statusColors: Record<OrderStatus, string> = {
  new: "bg-status-new text-white",
  processing: "bg-status-processing text-black",
  contacted: "bg-status-contacted text-white",
  scheduled: "bg-status-scheduled text-white",
  connected: "bg-status-connected text-white",
  cancelled: "bg-status-cancelled text-white",
  rejected: "bg-status-rejected text-white",
};

export function Badge({
  status,
  className,
}: {
  status: OrderStatus | string;
  className?: string;
}) {
  const color =
    statusColors[status as OrderStatus] ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[10px] px-2.5 py-1 text-xs font-frame",
        color,
        className
      )}
      style={{ fontFamily: '"TT Firs Neue", sans-serif' }}
    >
      {status}
    </span>
  );
}
