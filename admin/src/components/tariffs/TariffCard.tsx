"use client";

import { Card } from "@/components/ui/Card";
import type { Tariff } from "@/types";

/** Макет: заголовки (подписи) — 14px, line-height 145% (=20px); значения — 16px, line-height 125% (=20px). Без зазора между подписью и значением в паре. */
const labelStyle: React.CSSProperties = {
  fontFamily: "'TT Firs Neue', sans-serif",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: 14,
  lineHeight: "20px",
  display: "flex",
  alignItems: "center",
  color: "rgba(16, 16, 16, 0.25)",
  margin: 0,
  padding: 0,
  minHeight: 20,
};

const valueStyle: React.CSSProperties = {
  fontFamily: "'TT Firs Neue', sans-serif",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: 16,
  lineHeight: "20px",
  display: "flex",
  alignItems: "center",
  color: "#101010",
  margin: 0,
  padding: 0,
  minHeight: 20,
};

/** Карточка 240×535px, отступ внутри 20px, между группами рядов 5px */
const CARD_WIDTH = 240;
const CARD_HEIGHT = 535;
const CARD_PADDING_PX = 20;
const ROW_GAP_PX = 5;

export function TariffCard({ tariff }: { tariff: Tariff }) {
  const providerName = (tariff as Tariff & { provider?: { name: string } }).provider?.name ?? "—";
  const category = "Жилое, кв.";

  const rowWrap = (marginBottom: number) => ({ marginBottom });

  return (
    <Card
      className="rounded-[20px] shrink-0 flex flex-col"
      style={{
        width: CARD_WIDTH,
        minWidth: CARD_WIDTH,
        minHeight: CARD_HEIGHT,
        padding: CARD_PADDING_PX,
        boxSizing: "border-box",
      }}
    >
      {/* 3 круга 30×30 сверху; третий прижат к правому краю; отступ до «Категория» 20px */}
      <div
        className="flex items-start shrink-0"
        style={{
          flexDirection: "row",
          marginBottom: 20,
          minHeight: 30,
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <div className="flex items-start shrink-0" style={{ gap: 5 }}>
          {[1, 2].map((i) => (
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
        <span
          className="shrink-0 bg-transparent"
          style={{
            width: 30,
            height: 30,
            minWidth: 30,
            minHeight: 30,
            border: "1px solid rgba(16, 16, 16, 0.15)",
            borderRadius: 15,
            boxSizing: "border-box",
            marginLeft: "auto",
          }}
        />
      </div>

      <div style={rowWrap(ROW_GAP_PX)}>
        <p style={labelStyle}>Категория</p>
        <p style={valueStyle}>{category}</p>
      </div>
      <div style={rowWrap(ROW_GAP_PX)}>
        <p style={labelStyle}>Название оператора</p>
        <p style={valueStyle} title={providerName}>{providerName}</p>
      </div>
      <div style={rowWrap(ROW_GAP_PX)}>
        <p style={labelStyle}>Название тарифного плана</p>
        <p style={valueStyle} title={tariff.name}>{tariff.name}</p>
      </div>

      <div style={rowWrap(ROW_GAP_PX)}>
        <p style={labelStyle}>WI</p>
        <p style={valueStyle}>{tariff.speed ? `${tariff.speed} Мбит/сек` : "—"}</p>
      </div>
      <div style={rowWrap(ROW_GAP_PX)}>
        <p style={labelStyle}>TV</p>
        <p style={valueStyle}>{tariff.tvChannels ? `${tariff.tvChannels} кан` : "—"}</p>
      </div>
      <div style={rowWrap(ROW_GAP_PX)}>
        <p style={labelStyle}>TV</p>
        <p style={valueStyle}>—</p>
      </div>
      <div style={rowWrap(ROW_GAP_PX)}>
        <p style={labelStyle}>SIM</p>
        <p style={valueStyle}>{tariff.mobileMinutes != null ? String(tariff.mobileMinutes) : "—"}</p>
      </div>
      <div style={rowWrap(ROW_GAP_PX)}>
        <p style={labelStyle}>SIM</p>
        <p style={valueStyle}>
          {tariff.mobileGB != null
            ? tariff.mobileGB >= 999
              ? "безлимит гигабайтов"
              : `${tariff.mobileGB} гигабайтов`
            : "—"}
        </p>
      </div>
      <div style={rowWrap(ROW_GAP_PX)}>
        <p style={labelStyle}>SIM</p>
        <p style={valueStyle}>{tariff.mobileSMS != null ? `${tariff.mobileSMS} смс` : "—"}</p>
      </div>
      <div style={{ marginBottom: 0 }}>
        <p style={labelStyle}>Плата, мес.</p>
        <p style={valueStyle}>{tariff.price != null ? `${tariff.price} р.` : "—"}</p>
      </div>
    </Card>
  );
}
