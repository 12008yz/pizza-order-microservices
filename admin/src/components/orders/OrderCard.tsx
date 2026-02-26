"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  formatPhone,
  formatDate,
  formatPrice,
  formatPriceMonthly,
  parsePhoneFromDisplay,
  parseDateFromDisplay,
  parsePriceFromDisplay,
} from "@/lib/utils";
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

const statusLabelToKey: Record<string, string> = Object.fromEntries(
  Object.entries(statusPhaseLabel).map(([k, v]) => [v, k])
);

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

const inputStyle: React.CSSProperties = {
  ...valueStyle,
  width: "100%",
  maxWidth: "100%",
  padding: 0,
  margin: 0,
  border: "none",
  outline: "none",
  background: "transparent",
  boxSizing: "border-box",
  cursor: "text",
};

function EditableFieldRow({
  label,
  value,
  last,
  isExpanded,
  fieldKey,
  onFieldChange,
  parseDisplayToRaw,
}: {
  label: string;
  value: string;
  last?: boolean;
  isExpanded?: boolean;
  fieldKey?: keyof Order;
  onFieldChange?: (key: keyof Order, val: string | number | null) => void;
  parseDisplayToRaw?: (key: keyof Order, display: string) => string | number | null;
}) {
  const canEdit = isExpanded && fieldKey && onFieldChange != null && parseDisplayToRaw != null;
  const displayValue = value;

  // В открытой карточке показываем тот же формат, что и в закрытой (value уже отформатирован)
  const nextVal = value ?? "";
  const [localValue, setLocalValue] = useState(nextVal);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!canEdit) return;
    if (inputRef.current !== document.activeElement) {
      setLocalValue(nextVal);
    }
  }, [nextVal, canEdit]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!fieldKey || !onFieldChange || !parseDisplayToRaw) return;
      const v = e.target.value;
      setLocalValue(v);
      const raw = parseDisplayToRaw(fieldKey, v);
      onFieldChange(fieldKey, raw);
    },
    [fieldKey, onFieldChange, parseDisplayToRaw]
  );

  if (canEdit) {
    return (
      <div style={{ marginBottom: last ? 0 : 5, minHeight: 40 }}>
        <p className="font-frame truncate" style={labelStyle}>
          {label}
        </p>
        <input
          ref={inputRef}
          type="text"
          className="font-frame"
          style={inputStyle}
          value={localValue}
          onChange={handleChange}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          aria-label={label}
        />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: last ? 0 : 5, minHeight: 40 }}>
      <p className="font-frame truncate" style={labelStyle}>
        {label}
      </p>
      <p className="font-frame truncate" style={valueStyle}>
        {displayValue}
      </p>
    </div>
  );
}

const COLUMN_WIDTH = 242;
const EXPANDED_WIDTH = 730;
const CARD_HEIGHT = 535;
const CARD_PADDING = 20;

type FieldDef = { label: string; value: string; fieldKey?: keyof Order };

export function OrderCard({
  order,
  isExpanded,
  onOrderChange,
}: {
  order: Order;
  isExpanded?: boolean;
  onOrderChange?: (order: Order) => void;
}) {
  const dotColor = statusDotColor[order.status] ?? "bg-[rgba(16,16,16,0.5)]";
  const orderWithRelations = order as Order & { provider?: { name: string }; tariff?: { name: string } };

  const handleFieldChange = useCallback(
    (key: keyof Order, val: string | number | null) => {
      onOrderChange?.({ ...order, [key]: val } as Order);
    },
    [order, onOrderChange]
  );

  const parseDisplayToRaw = useCallback(
    (key: keyof Order, display: string): string | number | null => {
      const s = display.trim();
      if (key === "phone") return s === "—" || !s ? "" : parsePhoneFromDisplay(s);
      if (
        key === "dateOfBirth" ||
        key === "preferredDate" ||
        key === "createdAt" ||
        key === "updatedAt"
      ) {
        const parsed = parseDateFromDisplay(s);
        return parsed as string | null;
      }
      if (key === "status") {
        if (s === "—" || !s) return null;
        return (statusLabelToKey[s] ?? s) as string;
      }
      if (
        key === "totalConnectionPrice" ||
        key === "totalMonthlyPrice" ||
        key === "totalEquipmentPrice"
      ) {
        return parsePriceFromDisplay(s);
      }
      if (s === "—" || s === "") return null;
      return s;
    },
    []
  );

  const column1Fields: FieldDef[] = [
    { label: "Номер лицевого счёта", value: String(order.id) },
    { label: "Номер сотового телефона", value: formatPhone(order.phone), fieldKey: "phone" },
    { label: "Персона", value: "Подключение квартиры" },
    { label: "Имя", value: order.firstName ?? "—", fieldKey: "firstName" },
    { label: "Фамилия", value: order.lastName ?? "—", fieldKey: "lastName" },
    { label: "Дата рождения", value: formatDate(order.dateOfBirth), fieldKey: "dateOfBirth" },
    { label: "Гражданство", value: order.citizenship ?? "Российское гражданство", fieldKey: "citizenship" },
    { label: "Технология", value: "FTTX · 8" },
    { label: "Компания", value: orderWithRelations.provider?.name ?? "—" },
    { label: "Комплектация", value: orderWithRelations.tariff?.name ?? "—" },
  ];

  const column2Fields: FieldDef[] = [
    { label: "Номер идентификатора", value: String(order.id) },
    { label: "Название населённого пункта", value: order.addressString ?? "—", fieldKey: "addressString" },
    { label: "Название пространства", value: order.addressString ?? "—", fieldKey: "addressString" },
    { label: "Номер дома", value: "—" },
    { label: "Номер подъезда", value: order.entrance ?? "—", fieldKey: "entrance" },
    { label: "Номер этажа", value: order.floor ?? "—", fieldKey: "floor" },
    { label: "Квартира", value: order.addressString ?? "—", fieldKey: "addressString" },
    { label: "Плата, подключения", value: formatPrice(order.totalConnectionPrice), fieldKey: "totalConnectionPrice" },
    { label: "Плата, месячная", value: formatPriceMonthly(order.totalMonthlyPrice), fieldKey: "totalMonthlyPrice" },
    { label: "Выплата за клиента", value: formatPrice(order.totalMonthlyPrice), fieldKey: "totalMonthlyPrice" },
  ];

  const column3Fields: FieldDef[] = [
    { label: "Фаза", value: statusPhaseLabel[order.status] ?? order.status, fieldKey: "status" },
    { label: "Дата появления", value: formatDate(order.createdAt), fieldKey: "createdAt" },
    { label: "Дата назначения", value: formatDate(order.preferredDate), fieldKey: "preferredDate" },
    { label: "Дата подключения", value: formatDate(order.updatedAt), fieldKey: "updatedAt" },
    { label: "WI-оборудование", value: order.routerOption ?? order.routerConfig ?? "—", fieldKey: "routerOption" },
    { label: "TV-оборудование", value: order.tvSettopOption ?? "Не предусмотрено", fieldKey: "tvSettopOption" },
    { label: "SIM-карта", value: order.simCardOption ?? "—", fieldKey: "simCardOption" },
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
        className="flex flex-col h-full overflow-hidden"
        style={{
          minWidth: isExpanded ? EXPANDED_WIDTH - CARD_PADDING * 2 : undefined,
        }}
      >
        {/* При раскрытии — общая шапка: круги слева и справа */}
        {isExpanded && (
          <div
            className="flex items-start justify-between shrink-0 w-full"
            dir="ltr"
            style={{
              marginBottom: 20,
              minHeight: 30,
              boxSizing: "border-box",
            }}
          >
            <div className="flex items-start" style={{ gap: 0 }}>
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
            <div
              className="flex items-start"
              style={{
                gap: 5,
                paddingRight: 5,
                boxSizing: "border-box",
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="rounded-full border border-[rgba(16,16,16,0.15)] shrink-0 bg-transparent"
                  style={{
                    width: 30,
                    height: 30,
                    minWidth: 30,
                    minHeight: 30,
                    marginRight: i === 4 ? 5 : undefined,
                  }}
                />
              ))}
              <span
                className="rounded-full border border-[rgba(16,16,16,0.15)] shrink-0 bg-transparent"
                style={{
                  width: 30,
                  height: 30,
                  minWidth: 30,
                  minHeight: 30,
                  marginLeft: 5,
                }}
              />
            </div>
          </div>
        )}

        <div
          className="flex flex-1 min-h-0 overflow-hidden"
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
            {/* Круги только в свёрнутом виде (в развёрнутом — в общей шапке выше) */}
            {!isExpanded && (
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
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {column1Fields.map(({ label, value, fieldKey }, i) => (
              <EditableFieldRow
                key={`col1-${label}-${i}`}
                label={label}
                value={value}
                last={i === column1Fields.length - 1}
                isExpanded={isExpanded}
                fieldKey={fieldKey}
                onFieldChange={handleFieldChange}
                parseDisplayToRaw={parseDisplayToRaw}
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

        {/* Колонки 2 и 3 — только в развёрнутом виде. Отступ 20px и Rectangle 68 между колонками. */}
        {isExpanded && (
          <>
            <span style={{ width: 20, minWidth: 20, flexShrink: 0 }} aria-hidden />
            <div
              className="shrink-0 self-stretch rounded-[20px]"
              style={{
                width: 6,
                minWidth: 6,
                boxSizing: "border-box",
                background: "linear-gradient(90deg, rgba(16,16,16,0.12) 0%, #FFFFFF 25%, #FFFFFF 75%, rgba(16,16,16,0.12) 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(16,16,16,0.06)",
                border: "1px solid rgba(16, 16, 16, 0.1)",
              }}
              aria-hidden
            />
            <div
              className="flex-1 min-w-[200px] flex flex-col"
              style={{ boxSizing: "border-box", paddingLeft: 20 }}
            >
              {column2Fields.map(({ label, value, fieldKey }, i) => (
                <EditableFieldRow
                  key={`col2-${label}-${i}`}
                  label={label}
                  value={value}
                  last={i === column2Fields.length - 1}
                  isExpanded={isExpanded}
                  fieldKey={fieldKey}
                  onFieldChange={handleFieldChange}
                  parseDisplayToRaw={parseDisplayToRaw}
                />
              ))}
            </div>
            <span style={{ width: 20, minWidth: 20, flexShrink: 0 }} aria-hidden />
            <div
              className="shrink-0 self-stretch rounded-[20px]"
              style={{
                width: 6,
                minWidth: 6,
                boxSizing: "border-box",
                background: "linear-gradient(90deg, rgba(16,16,16,0.12) 0%, #FFFFFF 25%, #FFFFFF 75%, rgba(16,16,16,0.12) 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(16,16,16,0.06)",
                border: "1px solid rgba(16, 16, 16, 0.1)",
              }}
              aria-hidden
            />
            <div
              className="flex-1 min-w-[200px] flex flex-col"
              style={{ boxSizing: "border-box", paddingLeft: 20 }}
            >
              {column3Fields.map(({ label, value, fieldKey }, i) => (
                <EditableFieldRow
                  key={`col3-${label}-${i}`}
                  label={label}
                  value={value}
                  last={i === column3Fields.length - 1}
                  isExpanded={isExpanded}
                  fieldKey={fieldKey}
                  onFieldChange={handleFieldChange}
                  parseDisplayToRaw={parseDisplayToRaw}
                />
              ))}
            </div>
          </>
        )}
        </div>
      </div>
    </Card>
  );

  return cardContent;
}
