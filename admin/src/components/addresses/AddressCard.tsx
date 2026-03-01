"use client";

import type { OrderAddress } from "@/types";

/** Как в макете: карточка 240×535px, отступ 20px, между полями 5px */
const CARD_PADDING = 20;
const ROW_GAP = 5;
const CARD_WIDTH = 240;
const CARD_MIN_HEIGHT = 535;

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

const valueUnderlineStyle: React.CSSProperties = {
  ...valueStyle,
  textDecoration: "underline",
};

interface AddressCardProps {
  address: OrderAddress;
}

function Row({ label, value, underline }: { label: string; value: string; underline?: boolean }) {
  return (
    <div style={{ marginBottom: ROW_GAP }}>
      <p style={labelStyle}>{label}</p>
      <p style={underline ? valueUnderlineStyle : valueStyle} title={value}>
        {value || "—"}
      </p>
    </div>
  );
}

export function AddressCard({ address }: AddressCardProps) {
  return (
    <div
      className="bg-white rounded-[20px] border border-transparent hover:border-[rgba(16,16,16,0.35)] transition-colors shrink-0"
      style={{
        width: CARD_WIDTH,
        minHeight: CARD_MIN_HEIGHT,
        padding: CARD_PADDING,
        boxSizing: "border-box",
        backdropFilter: "blur(7.5px)",
        WebkitBackdropFilter: "blur(7.5px)",
      }}
    >
      {/* По макету: только 3 серых круга сверху (Rectangle 41, 40, 42) */}
      <div
        className="flex items-start shrink-0"
        dir="ltr"
        style={{
          flexDirection: "row",
          marginBottom: 12,
          minHeight: 30,
          gap: 5,
          boxSizing: "border-box",
        }}
      >
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="shrink-0 bg-transparent"
            style={{
              width: 30,
              height: 30,
              minWidth: 30,
              minHeight: 30,
              border: "1px solid rgba(16, 16, 16, 0.15)",
              borderRadius: 15,
              boxSizing: "border-box",
            }}
          />
        ))}
      </div>
      {/* Категория — значение с подчёркиванием, как в макете */}
      <div style={{ marginBottom: ROW_GAP }}>
        <p style={labelStyle}>Категория</p>
        <p style={valueUnderlineStyle}>{address.category}</p>
      </div>
      <Row label="Название населённого ..." value={address.settlementName} underline />
      <Row label="Название пространства" value={address.spaceName} underline />
      <Row label="Номер дома" value={address.houseNumber} underline />
      <Row label="Всего подъездов" value={address.entrances ?? "—"} />
      <Row label="Всего полетов" value={address.floors ?? "—"} />
      <Row
        label="Всего квар."
        value={address.apartments != null ? `${address.apartments} кв.` : "—"}
      />
    </div>
  );
}
