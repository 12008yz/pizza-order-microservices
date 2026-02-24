"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPhone, formatDate } from "@/lib/utils";
import type { Order } from "@/types";
import { cn } from "@/lib/utils";

const statusDotColor: Record<string, string> = {
  new: "bg-[#8091FF]",
  processing: "bg-[#FFDD80]",
  contacted: "bg-[#8091FF]",
  scheduled: "bg-[#FFDD80]",
  connected: "bg-[#85EE70]",
  cancelled: "bg-[#FF8080]",
  rejected: "bg-[#FF8080]",
};

const labelStyle = "font-frame text-[14px] leading-[145%] text-[rgba(16,16,16,0.25)]";
const valueStyle = "font-frame text-[16px] leading-[125%] text-[#101010] truncate";

export function OrderCard({ order }: { order: Order }) {
  const dotColor = statusDotColor[order.status] ?? "bg-[rgba(16,16,16,0.5)]";

  return (
    <Link href={`/orders/${order.id}`} className="block">
      <Card
        className="h-full hover:border-[rgba(16,16,16,0.35)] transition-colors rounded-[20px] border-[rgba(16,16,16,0.15)] backdrop-blur-[7.5px]"
        style={{ backdropFilter: "blur(7.5px)" }}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={cn("w-3 h-3 rounded-full shrink-0 mt-0.5", dotColor)} />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-[rgba(16,16,16,0.25)]" />
            ))}
          </div>
        </div>
        <div className="space-y-1.5 text-sm">
          <div>
            <p className={labelStyle}>Номер лицевого счёта</p>
            <p className={valueStyle}>{order.id}</p>
          </div>
          <div>
            <p className={labelStyle}>Номер сот. тел.</p>
            <p className={valueStyle}>{formatPhone(order.phone)}</p>
          </div>
          <div>
            <p className={labelStyle}>Персона</p>
            <p className={valueStyle}>Подкл. квартиры</p>
          </div>
          <div>
            <p className={labelStyle}>Имя</p>
            <p className={valueStyle}>{order.firstName ?? "—"}</p>
          </div>
          <div>
            <p className={labelStyle}>Фамилия</p>
            <p className={valueStyle}>{order.lastName ?? "—"}</p>
          </div>
          <div>
            <p className={labelStyle}>Дата рождения</p>
            <p className={valueStyle}>{formatDate(order.dateOfBirth)}</p>
          </div>
          <div>
            <p className={labelStyle}>Гражданство</p>
            <p className={valueStyle}>{order.citizenship ?? "Российское"}</p>
          </div>
          <div>
            <p className={labelStyle}>Технология</p>
            <p className={valueStyle}>FTTX · 8</p>
          </div>
          <div>
            <p className={labelStyle}>Компания</p>
            <p className={valueStyle}>{(order as Order & { provider?: { name: string } }).provider?.name ?? "—"}</p>
          </div>
          <div>
            <p className={labelStyle}>Комплектация</p>
            <p className={valueStyle}>{(order as Order & { tariff?: { name: string } }).tariff?.name ?? "—"}</p>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-[rgba(16,16,16,0.1)]">
          <Badge status={order.status} />
        </div>
      </Card>
    </Link>
  );
}
