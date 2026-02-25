"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPhone, formatDate, formatPrice, formatPriceMonthly } from "@/lib/utils";
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

const statusPhaseLabel: Record<string, string> = {
  new: "Формирование",
  processing: "Наведение",
  contacted: "Конкретизирование",
  scheduled: "Вознаграждение",
  connected: "Подключение",
  cancelled: "Отменён",
  rejected: "Отклонён",
};

const labelStyle: React.CSSProperties = {
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
};

const valueStyle: React.CSSProperties = {
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
};

function FieldRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div style={{ marginBottom: last ? 0 : 5, minHeight: 40 }}>
      <p className="font-frame truncate" style={labelStyle}>
        {label}
      </p>
      <p className="font-frame truncate" style={valueStyle}>
        {value}
      </p>
    </div>
  );
}

const COLUMN_WIDTH = 242;
const EXPANDED_WIDTH = 730;
const CARD_HEIGHT = 535;
const CARD_PADDING = 20;

export function OrderCard({
  order,
  isExpanded,
}: {
  order: Order;
  isExpanded?: boolean;
}) {
  const dotColor = statusDotColor[order.status] ?? "bg-[rgba(16,16,16,0.5)]";
  const orderWithRelations = order as Order & { provider?: { name: string }; tariff?: { name: string } };

  const column1Fields = [
    { label: "Номер лицевого счёта", value: String(order.id) },
    { label: "Номер сотового телефона", value: formatPhone(order.phone) },
    { label: "Персона", value: "Подключение квартиры" },
    { label: "Имя", value: order.firstName ?? "—" },
    { label: "Фамилия", value: order.lastName ?? "—" },
    { label: "Дата рождения", value: formatDate(order.dateOfBirth) },
    { label: "Гражданство", value: order.citizenship ?? "Российское гражданство" },
    { label: "Технология", value: "FTTX · 8" },
    { label: "Компания", value: orderWithRelations.provider?.name ?? "—" },
    { label: "Комплектация", value: orderWithRelations.tariff?.name ?? "—" },
  ];

  const column2Fields = [
    { label: "Номер идентификатора", value: String(order.id) },
    { label: "Название населённого пункта", value: order.addressString ?? "—" },
    { label: "Название пространства", value: order.addressString ?? "—" },
    { label: "Номер дома", value: "—" },
    { label: "Номер подъезда", value: order.entrance ?? "—" },
    { label: "Номер этажа", value: order.floor ?? "—" },
    { label: "Квартира", value: order.addressString ?? "—" },
    { label: "Плата, подключения", value: formatPrice(order.totalConnectionPrice) },
    { label: "Плата, месячная", value: formatPriceMonthly(order.totalMonthlyPrice) },
    { label: "Выплата за клиента", value: formatPrice(order.totalMonthlyPrice) },
  ];

  const column3Fields = [
    { label: "Фаза", value: statusPhaseLabel[order.status] ?? order.status },
    { label: "Дата появления", value: formatDate(order.createdAt) },
    { label: "Дата назначения", value: formatDate(order.preferredDate) },
    { label: "Дата подключения", value: formatDate(order.updatedAt) },
    { label: "WI-оборудование", value: order.routerOption ?? order.routerConfig ?? "—" },
    { label: "TV-оборудование", value: order.tvSettopOption ?? "Не предусмотрено" },
    { label: "SIM-карта", value: order.simCardOption ?? "—" },
  ];

  const cardContent = (
    <Card
      className="hover:border-[rgba(16,16,16,0.35)]"
      style={{
        width: "100%",
        height: CARD_HEIGHT,
        padding: CARD_PADDING,
        boxSizing: "border-box",
      }}
    >
      <div
        className="flex h-full overflow-hidden"
        style={{
          minWidth: isExpanded ? EXPANDED_WIDTH - CARD_PADDING * 2 : undefined,
        }}
      >
        {/* Колонка 1: основные данные */}
        <div
          className="shrink-0 flex flex-col"
          style={{
            width: COLUMN_WIDTH - CARD_PADDING * 2,
            boxSizing: "border-box",
          }}
        >
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
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {column1Fields.map(({ label, value }, i) => (
              <FieldRow
                key={label}
                label={label}
                value={value}
                last={i === column1Fields.length - 1}
              />
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
        </div>

        {/* Колонки 2 и 3 — только в развёрнутом виде */}
        {isExpanded && (
          <>
            <div
              className="flex-1 min-w-[200px] flex flex-col pl-6 border-l border-[rgba(16,16,16,0.1)]"
              style={{ boxSizing: "border-box" }}
            >
              {column2Fields.map(({ label, value }, i) => (
                <FieldRow
                  key={label}
                  label={label}
                  value={value}
                  last={i === column2Fields.length - 1}
                />
              ))}
            </div>
            <div
              className="flex-1 min-w-[200px] flex flex-col pl-6 border-l border-[rgba(16,16,16,0.1)]"
              style={{ boxSizing: "border-box" }}
            >
              {column3Fields.map(({ label, value }, i) => (
                <FieldRow
                  key={label}
                  label={label}
                  value={value}
                  last={i === column3Fields.length - 1}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );

  return cardContent;
}
