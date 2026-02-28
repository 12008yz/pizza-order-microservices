"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Select, type SelectOption } from "@/components/ui/Select";
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

/** Разбивка адреса на 4 фиксированных сегмента (по позиции), чтобы ввод в «Номер дома» не попадал в «Название пространства». */
function parseAddress(s: string | null | undefined): {
  settlement: string;
  space: string;
  house: string;
  apartment: string;
} {
  if (!s?.trim()) return { settlement: "", space: "", house: "", apartment: "" };
  const raw = s.split(",").map((p) => p.trim());
  return {
    settlement: raw[0] ?? "",
    space: raw[1] ?? "",
    house: raw[2] ?? "",
    apartment: (raw.slice(3).join(", ") ?? "").trim(),
  };
}

/** Сборка адреса всегда из 4 сегментов (пустые сохраняются), чтобы позиции полей не съезжали. */
function formatAddress(p: {
  settlement: string;
  space: string;
  house: string;
  apartment: string;
}): string {
  return [p.settlement, p.space, p.house, p.apartment].join(", ");
}

function AddressPartRow({
  label,
  partKey,
  addressString,
  last,
  isExpanded,
  onAddressChange,
  suggestions = [],
}: {
  label: string;
  partKey: "settlement" | "space" | "house" | "apartment";
  addressString: string | null;
  last?: boolean;
  isExpanded?: boolean;
  onAddressChange: (newAddressString: string) => void;
  suggestions?: SelectOption[];
}) {
  const parts = parseAddress(addressString);
  const currentPart = parts[partKey] ?? "";
  const value = currentPart || "—";
  const [local, setLocal] = useState(currentPart);

  useEffect(() => {
    setLocal(currentPart);
  }, [currentPart]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setLocal(v);
      const next = { ...parts, [partKey]: v };
      onAddressChange(formatAddress(next));
    },
    [parts, partKey, onAddressChange]
  );

  const handleSelect = useCallback(
    (selected: string | number | null) => {
      const v = selected != null ? String(selected) : "";
      setLocal(v);
      const next = { ...parts, [partKey]: v };
      onAddressChange(formatAddress(next));
    },
    [parts, partKey, onAddressChange]
  );

  const optionsWithCurrent: SelectOption[] =
    currentPart && !suggestions.some((o) => String(o.value) === currentPart)
      ? [{ value: currentPart, label: currentPart }, ...suggestions]
      : suggestions;

  if (isExpanded) {
    return (
      <div style={{ marginBottom: last ? 0 : ROW_GAP, minHeight: ROW_MIN_HEIGHT }} onClick={(e) => e.stopPropagation()}>
        <p className="font-frame truncate" style={labelStyle}>{label}</p>
        {optionsWithCurrent.length > 0 ? (
          <Select
            value={currentPart}
            options={optionsWithCurrent}
            onChange={handleSelect}
            placeholder="—"
            inline
          />
        ) : (
          <input
            type="text"
            className="font-frame"
            style={inputStyle}
            value={local}
            onChange={handleChange}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            aria-label={label}
          />
        )}
      </div>
    );
  }
  return (
    <div style={{ marginBottom: last ? 0 : ROW_GAP, minHeight: ROW_MIN_HEIGHT }}>
      <p className="font-frame truncate" style={labelStyle}>{label}</p>
      <p className="font-frame truncate" style={valueStyle}>{value || "—"}</p>
    </div>
  );
}

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
      <div style={{ marginBottom: last ? 0 : ROW_GAP, minHeight: ROW_MIN_HEIGHT }}>
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
    <div style={{ marginBottom: last ? 0 : ROW_GAP, minHeight: ROW_MIN_HEIGHT }}>
      <p className="font-frame truncate" style={labelStyle}>
        {label}
      </p>
      <p className="font-frame truncate" style={valueStyle}>
        {displayValue}
      </p>
    </div>
  );
}

function SelectFieldRow({
  label,
  value,
  options,
  last,
  isExpanded,
  fieldKey,
  onFieldChange,
  dropdownPlacement,
}: {
  label: string;
  value: string | number | null;
  options: SelectOption[];
  last?: boolean;
  isExpanded?: boolean;
  fieldKey?: keyof Order;
  onFieldChange?: (key: keyof Order, val: string | number | null) => void;
  dropdownPlacement?: "up" | "down";
}) {
  const canSelect = isExpanded && options.length > 0;
  const displayValue = value != null && value !== "" ? String(value) : "—";
  const selectedOption = options.find((o) => o.value === value || String(o.value) === displayValue);
  const displayText = selectedOption?.label ?? (value != null && value !== "" ? String(value) : "—");

  if (canSelect) {
    return (
      <div style={{ marginBottom: last ? 0 : ROW_GAP, minHeight: ROW_MIN_HEIGHT }} onClick={(e) => e.stopPropagation()}>
        <p className="font-frame truncate" style={labelStyle}>
          {label}
        </p>
        <Select
          value={value}
          options={options}
          onChange={(val) => fieldKey && onFieldChange?.(fieldKey, val)}
          placeholder="—"
          inline
          placement={dropdownPlacement}
        />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: last ? 0 : ROW_GAP, minHeight: ROW_MIN_HEIGHT }}>
      <p className="font-frame truncate" style={labelStyle}>
        {label}
      </p>
      <p className="font-frame truncate" style={valueStyle}>
        {displayText}
      </p>
    </div>
  );
}

const COLUMN_WIDTH = 242;
const EXPANDED_WIDTH = 730;
const CARD_HEIGHT = 535;
const CARD_PADDING = 20;
/** Отступ между полями (5px). Снизу карточки — 20px (CARD_PADDING). */
const ROW_GAP = 5;
const ROW_MIN_HEIGHT = 36;

type FieldDef = {
  label: string;
  value: string;
  fieldKey?: keyof Order;
  /** Поле для выбора из списка (выпадающий список из БД) */
  selectFieldKey?: keyof Order;
  selectValue?: string | number | null;
  options?: SelectOption[];
  /** Открывать выпадающий список вверх (для полей внизу колонки) */
  dropdownPlacement?: "up" | "down";
  /** Часть адреса: показывается и редактируется отдельно, сохраняется в addressString */
  addressPart?: "settlement" | "space" | "house" | "apartment";
  /** Подсказки для этой части адреса (насел. пункт = города, пространство = улицы и т.д.) */
  addressSuggestions?: SelectOption[];
};

/** Справочники для выпадающих списков (только из БД). Как в 1 фрейме (ConnectionTypeModal). */
const PERSONA_OPTIONS: SelectOption[] = [
  { value: "apartment", label: "Подключение квартиры" },
  { value: "private", label: "Подключение частного сектора" },
  { value: "office", label: "Подключение офиса" },
];

const ROUTER_OPTIONS: SelectOption[] = [
  { value: "Рассрочка на 24 мес.", label: "Рассрочка на 24 мес." },
  { value: "Не предусмотрено", label: "Не предусмотрено" },
  { value: "—", label: "—" },
];

const TV_OPTIONS: SelectOption[] = [
  { value: "Не предусмотрено", label: "Не предусмотрено" },
  { value: "—", label: "—" },
];

const SIM_OPTIONS: SelectOption[] = [
  { value: "Подключение текущего номера", label: "Подключение текущего номера" },
  { value: "Подключение нового номера", label: "Подключение нового номера" },
  { value: "—", label: "—" },
];

const QUANTITY_OPTIONS: SelectOption[] = [
  { value: "—", label: "—" },
  { value: "1 шт.", label: "1 шт." },
  { value: "2 шт.", label: "2 шт." },
  { value: "3 шт.", label: "3 шт." },
];

export function OrderCard({
  order,
  isExpanded,
  onOrderChange,
  providers = [],
  tariffs = [],
  cities = [],
  streets = [],
}: {
  order: Order;
  isExpanded?: boolean;
  onOrderChange?: (order: Order) => void;
  providers?: { id: number; name: string }[];
  tariffs?: { id: number; name: string }[];
  /** Города из БД для подсказок «Название населённого пункта» */
  cities?: { id: number; name: string }[];
  /** Улицы из БД для подсказок «Название пространства» (можно фильтровать по городу) */
  streets?: { id: number; name: string }[];
}) {
  const dotColor = statusDotColor[order.status] ?? "bg-[rgba(16,16,16,0.5)]";
  const orderWithRelations = order as Order & { provider?: { name: string }; tariff?: { name: string } };

  const providerOptions: SelectOption[] = providers.map((p) => ({ value: p.id, label: p.name }));
  const tariffOptions: SelectOption[] = tariffs.map((t) => ({ value: t.id, label: t.name }));
  const statusOptions: SelectOption[] = Object.entries(statusPhaseLabel).map(([k, v]) => ({ value: k, label: v }));
  const citySuggestions: SelectOption[] = cities.map((c) => ({ value: c.name, label: c.name }));
  const streetSuggestions: SelectOption[] = streets.map((s) => ({ value: s.name, label: s.name }));

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
    {
      label: "Персона",
      value:
        order.connectionType === "office"
          ? "Подключение офиса"
          : order.connectionType === "private"
            ? "Подключение частного сектора"
            : "Подключение квартиры",
      selectFieldKey: "connectionType",
      selectValue: order.connectionType ?? "apartment",
      options: PERSONA_OPTIONS,
    },
    { label: "Имя", value: order.firstName ?? "—", fieldKey: "firstName" },
    { label: "Фамилия", value: order.lastName ?? "—", fieldKey: "lastName" },
    { label: "Дата рождения", value: formatDate(order.dateOfBirth), fieldKey: "dateOfBirth" },
    { label: "Гражданство", value: order.citizenship ?? "Российское гражданство", fieldKey: "citizenship" },
    { label: "Технология", value: "FTTX · 8" },
    {
      label: "Компания",
      value: orderWithRelations.provider?.name ?? "—",
      selectFieldKey: "providerId",
      selectValue: order.providerId,
      options: providerOptions,
      dropdownPlacement: "up",
    },
    {
      label: "Комплектация",
      value: orderWithRelations.tariff?.name ?? "—",
      selectFieldKey: "tariffId",
      selectValue: order.tariffId,
      options: tariffOptions,
      dropdownPlacement: "up",
    },
  ];

  const entranceOptions: SelectOption[] = order.entrance
    ? [{ value: order.entrance, label: order.entrance }]
    : [{ value: "—", label: "—" }];
  const floorOptions: SelectOption[] = order.floor
    ? [{ value: order.floor, label: order.floor }]
    : [{ value: "—", label: "—" }];

  const handleAddressChange = useCallback(
    (newAddressString: string) => {
      onOrderChange?.({ ...order, addressString: newAddressString || null } as Order);
    },
    [order, onOrderChange]
  );

  const column2Fields: FieldDef[] = [
    { label: "Номер идентификатора", value: String(order.id) },
    {
      label: "Название населённого пункта",
      value: parseAddress(order.addressString).settlement || "—",
      addressPart: "settlement",
      addressSuggestions: citySuggestions,
    },
    {
      label: "Название пространства",
      value: parseAddress(order.addressString).space || "—",
      addressPart: "space",
      addressSuggestions: streetSuggestions,
    },
    {
      label: "Номер дома",
      value: parseAddress(order.addressString).house || "—",
      addressPart: "house",
    },
    {
      label: "Номер подъезда",
      value: order.entrance ?? "—",
      selectFieldKey: "entrance",
      selectValue: order.entrance,
      options: entranceOptions,
    },
    {
      label: "Номер этажа",
      value: order.floor ?? "—",
      selectFieldKey: "floor",
      selectValue: order.floor,
      options: floorOptions,
    },
    {
      label: "Квартира",
      value: parseAddress(order.addressString).apartment || "—",
      addressPart: "apartment",
    },
    { label: "Плата, подключения", value: formatPrice(order.totalConnectionPrice) },
    { label: "Плата, месячная", value: formatPriceMonthly(order.totalMonthlyPrice) },
    { label: "Выплата за клиента", value: formatPrice(order.totalMonthlyPrice) },
  ];

  const column3Fields: FieldDef[] = [
    {
      label: "Фаза",
      value: statusPhaseLabel[order.status] ?? order.status,
      selectFieldKey: "status",
      selectValue: order.status,
      options: statusOptions,
    },
    { label: "Дата появления", value: formatDate(order.createdAt), fieldKey: "createdAt" },
    { label: "Дата назначения", value: formatDate(order.preferredDate), fieldKey: "preferredDate" },
    { label: "Дата подключения", value: formatDate(order.updatedAt), fieldKey: "updatedAt" },
    {
      label: "WI-оборудование",
      value: order.routerOption ?? order.routerConfig ?? "—",
      selectFieldKey: "routerOption",
      selectValue: order.routerOption ?? order.routerConfig ?? null,
      options: ROUTER_OPTIONS,
      dropdownPlacement: "up",
    },
    {
      label: "WI - количество",
      value: order.routerQuantity ?? (order.routerOption || order.routerConfig ? "1 шт." : "—"),
      selectFieldKey: "routerQuantity",
      selectValue: order.routerQuantity ?? (order.routerOption || order.routerConfig ? "1 шт." : null),
      options: QUANTITY_OPTIONS,
      dropdownPlacement: "up",
    },
    {
      label: "TV-оборудование",
      value: order.tvSettopOption ?? "Не предусмотрено",
      selectFieldKey: "tvSettopOption",
      selectValue: order.tvSettopOption ?? null,
      options: TV_OPTIONS,
      dropdownPlacement: "up",
    },
    {
      label: "TV - количество",
      value:
        order.tvSettopOption && order.tvSettopOption !== "Не предусмотрено" ? "1 шт." : "Не предусмотрено",
    },
    {
      label: "SIM-карта",
      value: order.simCardOption ?? "—",
      selectFieldKey: "simCardOption",
      selectValue: order.simCardOption ?? null,
      options: SIM_OPTIONS,
      dropdownPlacement: "up",
    },
    {
      label: "SIM-карта - количество",
      value: order.simCardOption && order.simCardOption !== "—" ? "1 шт." : "—",
    },
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
              marginBottom: 12,
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
                  marginBottom: 12,
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
              {column1Fields.map((field, i) =>
                field.options ? (
                  <SelectFieldRow
                    key={`col1-${field.label}-${i}`}
                    label={field.label}
                    value={field.selectValue ?? field.value}
                    options={field.options}
                    last={i === column1Fields.length - 1}
                    isExpanded={isExpanded}
                    fieldKey={field.selectFieldKey}
                    onFieldChange={handleFieldChange}
                    dropdownPlacement={field.dropdownPlacement}
                  />
                ) : (
                  <EditableFieldRow
                    key={`col1-${field.label}-${i}`}
                    label={field.label}
                    value={field.value}
                    last={i === column1Fields.length - 1}
                    isExpanded={isExpanded}
                    fieldKey={field.fieldKey}
                    onFieldChange={handleFieldChange}
                    parseDisplayToRaw={parseDisplayToRaw}
                  />
                )
              )}
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
              {column2Fields.map((field, i) =>
                field.addressPart ? (
                  <AddressPartRow
                    key={`col2-${field.label}-${i}`}
                    label={field.label}
                    partKey={field.addressPart}
                    addressString={order.addressString}
                    last={i === column2Fields.length - 1}
                    isExpanded={isExpanded}
                    onAddressChange={handleAddressChange}
                    suggestions={field.addressSuggestions}
                  />
                ) : field.options ? (
                  <SelectFieldRow
                    key={`col2-${field.label}-${i}`}
                    label={field.label}
                    value={field.selectValue ?? field.value}
                    options={field.options}
                    last={i === column2Fields.length - 1}
                    isExpanded={isExpanded}
                    fieldKey={field.selectFieldKey}
                    onFieldChange={handleFieldChange}
                    dropdownPlacement={field.dropdownPlacement}
                  />
                ) : (
                  <EditableFieldRow
                    key={`col2-${field.label}-${i}`}
                    label={field.label}
                    value={field.value}
                    last={i === column2Fields.length - 1}
                    isExpanded={isExpanded}
                    fieldKey={field.fieldKey}
                    onFieldChange={handleFieldChange}
                    parseDisplayToRaw={parseDisplayToRaw}
                  />
                )
              )}
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
              {column3Fields.map((field, i) =>
                field.options ? (
                  <SelectFieldRow
                    key={`col3-${field.label}-${i}`}
                    label={field.label}
                    value={field.selectValue ?? field.value}
                    options={field.options}
                    last={i === column3Fields.length - 1}
                    isExpanded={isExpanded}
                    fieldKey={field.selectFieldKey}
                    onFieldChange={handleFieldChange}
                    dropdownPlacement={field.dropdownPlacement}
                  />
                ) : (
                  <EditableFieldRow
                    key={`col3-${field.label}-${i}`}
                    label={field.label}
                    value={field.value}
                    last={i === column3Fields.length - 1}
                    isExpanded={isExpanded}
                    fieldKey={field.fieldKey}
                    onFieldChange={handleFieldChange}
                    parseDisplayToRaw={parseDisplayToRaw}
                  />
                )
              )}
            </div>
          </>
          )}
        </div>
      </div>
    </Card>
  );

  return cardContent;
}
