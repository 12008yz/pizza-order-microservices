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
      <Card
        className="hover:border-[rgba(16,16,16,0.35)] transition-colors"
        style={{
          width: 242,
          height: 535,
          paddingTop: 20,
          paddingRight: 20,
          paddingBottom: 20,
          paddingLeft: 20,
          boxSizing: "border-box",
        }}
      >
        {/* Без gap: точка 10 + спейсер 20 + круги 30×5 + отступы только между кругами 5×4 = 200px. Иначе gap между всеми 7 элементами даёт 30px и ряд 210px → переполнение. */}
        <div
          className="flex items-start shrink-0"
          dir="ltr"
          style={{
            flexDirection: "row",
            marginBottom: 20,
            minHeight: 30,
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <span
            className={cn("rounded-full shrink-0", dotColor)}
            style={{ width: 10, height: 10, minWidth: 10, minHeight: 10 }}
          />
          <span style={{ width: 20, minWidth: 20, flexShrink: 0 }} aria-hidden />
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="rounded-full border border-[rgba(16,16,16,0.15)] shrink-0 bg-transparent"
              style={{
                width: 30,
                height: 30,
                minWidth: 30,
                minHeight: 30,
                marginLeft: i === 1 ? 0 : 5,
              }}
            />
          ))}
        </div>

        {/* Поля по макету: группа 200×40; подпись 14px/145%, #101010 25%; значение 16px/125%, #101010; font-weight 400 */}
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
                minHeight: 40,
              }}
            >
              <p
                className="font-frame truncate"
                style={{
                  fontFamily: "'TT Firs Neue', sans-serif",
                  fontStyle: "normal",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "145%",
                  display: "flex",
                  alignItems: "center",
                  color: "rgba(16, 16, 16, 0.25)",
                  margin: 0,
                  minHeight: 20,
                }}
              >
                {label}
              </p>
              <p
                className="font-frame truncate"
                style={{
                  fontFamily: "'TT Firs Neue', sans-serif",
                  fontStyle: "normal",
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: "125%",
                  display: "flex",
                  alignItems: "center",
                  color: "#101010",
                  margin: 0,
                  minHeight: 20,
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
