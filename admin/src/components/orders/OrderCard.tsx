"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPhone, formatDate } from "@/lib/utils";
import type { Order } from "@/types";
import { cn } from "@/lib/utils";

const statusDotColor: Record<string, string> = {
  new: "bg-status-new",
  processing: "bg-status-processing",
  contacted: "bg-status-contacted",
  scheduled: "bg-status-scheduled",
  connected: "bg-status-connected",
  cancelled: "bg-status-cancelled",
  rejected: "bg-status-rejected",
};

export function OrderCard({ order }: { order: Order }) {
  const dotColor = statusDotColor[order.status] ?? "bg-muted-foreground";

  return (
    <Link href={`/orders/${order.id}`} className="block">
      <Card className="h-full hover:border-foreground/30 transition-colors">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={cn("w-3 h-3 rounded-full shrink-0 mt-0.5", dotColor)} />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            ))}
          </div>
        </div>
        <div className="space-y-1.5 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Номер лицевого счёта</p>
            <p className="font-medium truncate">{order.id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Номер сот. тел.</p>
            <p className="truncate">{formatPhone(order.phone)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Персона</p>
            <p className="truncate">Подкл. квартиры</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Имя</p>
            <p className="truncate">{order.firstName ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Фамилия</p>
            <p className="truncate">{order.lastName ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Дата рождения</p>
            <p className="truncate">{formatDate(order.dateOfBirth)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Гражданство</p>
            <p className="truncate">{order.citizenship ?? "Российское"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Технология</p>
            <p className="truncate">FTTX · 8</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Компания</p>
            <p className="truncate">{order.provider?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Комплектация</p>
            <p className="truncate">{order.tariff?.name ?? "—"}</p>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-border">
          <Badge status={order.status} />
        </div>
      </Card>
    </Link>
  );
}
