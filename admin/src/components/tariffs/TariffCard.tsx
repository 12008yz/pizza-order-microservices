"use client";

import { Card } from "@/components/ui/Card";
import type { Tariff } from "@/types";

/** Как в карточке адреса: отступ между рядами 5px, стили подписи и значения */
const ROW_GAP = 5;

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

/** Круг 30×30 с галочкой — как серые круги в карточке адреса, но с иконкой внутри */
function CheckCircleIcon() {
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0 rounded-full bg-transparent"
      style={{
        width: 30,
        height: 30,
        minWidth: 30,
        minHeight: 30,
        border: "1px solid rgba(16, 16, 16, 0.15)",
        borderRadius: 15,
        boxSizing: "border-box",
      }}
    >
      <svg width="10" height="8" viewBox="0 0 8 6" fill="none" aria-hidden>
        <path d="M1 3L3 5L7 1" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** Как на странице «База адресов»: карточка 240×535px, отступ между карточками 5px */
const CARD_WIDTH = 240;
const CARD_MIN_HEIGHT = 535;

export function TariffCard({ tariff }: { tariff: Tariff }) {
  const providerName = (tariff as Tariff & { provider?: { name: string } }).provider?.name ?? "—";
  const category = "Жилое, кв.";

  return (
    <Card
      className="rounded-[20px] p-5 shrink-0"
      style={{
        width: CARD_WIDTH,
        minWidth: CARD_WIDTH,
        minHeight: CARD_MIN_HEIGHT,
        boxSizing: "border-box",
      }}
    >
      {/* Как в карточке адреса: 3 серых круга 30×30 сверху; третий прижат к правому краю — 20px от края за счёт padding карточки */}
      <div
        className="flex items-start shrink-0"
        style={{
          flexDirection: "row",
          marginBottom: 12,
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

      <div style={{ marginBottom: ROW_GAP }}>
        <p style={labelStyle}>Категория</p>
        <p style={valueStyle}>{category}</p>
      </div>
      <div style={{ marginBottom: ROW_GAP }}>
        <p style={labelStyle}>Название опер.</p>
        <p style={valueStyle} title={providerName}>{providerName}</p>
      </div>
      <div style={{ marginBottom: ROW_GAP }}>
        <p style={labelStyle}>Тарифный план</p>
        <p style={valueStyle} title={tariff.name}>{tariff.name}</p>
      </div>

      <div className="flex flex-col" style={{ gap: ROW_GAP, marginBottom: ROW_GAP }}>
        <div className="flex items-center gap-2 min-h-[20px]">
          <CheckCircleIcon />
          <div className="flex-1 min-w-0">
            <p style={{ ...valueStyle, margin: 0 }}>{tariff.speed ? `${tariff.speed} Мбит/сек` : "—"}</p>
            <p style={{ ...labelStyle, margin: 0, marginTop: 2 }}>Безлимитное соединение в квартире</p>
          </div>
        </div>
        <div className="flex items-center gap-2 min-h-[20px]">
          <CheckCircleIcon />
          <div className="flex-1 min-w-0">
            <p style={{ ...valueStyle, margin: 0 }}>{tariff.tvChannels ? `${tariff.tvChannels} каналов` : "—"}</p>
            <p style={{ ...labelStyle, margin: 0, marginTop: 2 }}>{tariff.hasTV ? "Телевидение" : " "}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 min-h-[20px]">
          <CheckCircleIcon />
          <div className="flex-1 min-w-0">
            <p style={{ ...valueStyle, margin: 0 }}>
              {tariff.mobileGB != null
                ? tariff.mobileGB >= 999
                  ? "безлимит гигабайтов"
                  : `${tariff.mobileMinutes ?? 0} мин · ${tariff.mobileGB} гигабайтов`
                : "—"}
            </p>
            <p style={{ ...labelStyle, margin: 0, marginTop: 2 }}>{tariff.hasMobile ? "Мобильное соединение" : " "}</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: ROW_GAP }}>
        <p style={valueStyle}>{tariff.price != null ? `${tariff.price} р./мес.` : "—"}</p>
      </div>
      <div style={{ marginBottom: ROW_GAP }}>
        <p style={labelStyle}>
          {tariff.connectionPrice === 0
            ? "Подключение от оператора за 0 р."
            : `Подключение от оператора за ${tariff.connectionPrice ?? "—"} р.`}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: ROW_GAP }}>
        <div style={{ marginBottom: 0 }}>
          <p style={labelStyle}>WI</p>
          <p style={valueStyle}>{tariff.speed ? `${tariff.speed} Мбит/сек` : "—"}</p>
        </div>
        <div style={{ marginBottom: 0 }}>
          <p style={labelStyle}>TV</p>
          <p style={valueStyle}>{tariff.tvChannels ? `${tariff.tvChannels} кан` : "—"}</p>
        </div>
        <div style={{ marginBottom: 0 }}>
          <p style={labelStyle}>SIM</p>
          <p style={valueStyle}>{tariff.mobileGB != null ? String(tariff.mobileGB) : "—"}</p>
        </div>
        <div style={{ marginBottom: 0 }}>
          <p style={labelStyle}>Плата, мес.</p>
          <p style={valueStyle}>{tariff.price != null ? `${tariff.price} р.` : "—"}</p>
        </div>
      </div>
    </Card>
  );
}
