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

export function OrderCard({ order }: { order: Order }) {
  const dotColor = statusDotColor[order.status] ?? "bg-[rgba(16,16,16,0.5)]";

  return (
    <Link href={`/orders/${order.id}`} className="block h-full">
      <Card className="hover:border-[rgba(16,16,16,0.35)] transition-colors" style={{ width: 240, height: 535 }}>
        {/* Верхний ряд: точка 10×10 px, отступ 20px до кругов, круги 30×30 px, между кругами 5px */}
        <div
          className="flex items-center"
          style={{
            marginBottom: 20,
            gap: 5,
          }}
        >
          <span
            className={cn("rounded-full shrink-0", dotColor)}
            style={{ width: 10, height: 10 }}
          />
          <span style={{ width: 20, flexShrink: 0 }} aria-hidden />
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="rounded-full border border-[rgba(16,16,16,0.15)] shrink-0 bg-transparent"
              style={{ width: 30, height: 30 }}
            />
          ))}
        </div>

        {/* Поля: подпись 14px, значение 16px; между подписью и значением 5px, между полями 5px */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { label: "Номер лицевого счёта", value: String(order.id) },
            { label: "Номер сотового телефона", value: formatPhone(order.phone) },
            { label: "Персона", value: "Подключение квартиры" },
            { label: "Имя", value: order.firstName ?? "—" },
            { label: "Фамилия", value: order.lastName ?? "—" },
            { label: "Дата рождения", value: formatDate(order.dateOfBirth) },
            { label: "Гражданство", value: order.citizenship ?? "Российское гражданство" },
            { label: "Технология", value: "FTTX · 8" },
            { label: "Компания", value: (order as Order & { provider?: { name: string } }).provider?.name ?? "—" },
            { label: "Комплектация", value: (order as Order & { tariff?: { name: string } }).tariff?.name ?? "—" },
          ].map(({ label, value }, i) => (
            <div
              key={label}
              style={{
                marginBottom: i < 9 ? 5 : 0,
              }}
            >
              <p
                className="font-frame truncate"
                style={{
                  fontSize: 14,
                  lineHeight: "145%",
                  color: "rgba(16,16,16,0.25)",
                  marginBottom: 5,
                }}
              >
                {label}
              </p>
              <p
                className="font-frame font-medium truncate"
                style={{
                  fontSize: 16,
                  lineHeight: "125%",
                  color: "#101010",
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 15,
            paddingTop: 15,
            borderTop: "1px solid rgba(16,16,16,0.1)",
          }}
        >
          <Badge status={order.status} />
        </div>
      </Card>
    </Link>
  );
}
