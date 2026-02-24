"use client";

import { Card } from "@/components/ui/Card";
import type { Tariff } from "@/types";

/** Иконка галочки как во frontend Frame3 */
function CheckCircleIcon() {
  return (
    <span className="inline-flex items-center justify-center flex-shrink-0 w-4 h-4 rounded-full border border-[#101010] bg-white">
      <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
        <path d="M1 3L3 5L7 1" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

const labelStyle = "font-frame text-xs leading-[125%] text-[rgba(16,16,16,0.5)]";
const valueStyle = "font-frame text-sm truncate text-[#101010]";
const featureText = "font-frame text-[16px] leading-[155%] text-[#101010]";
const featureDesc = "font-frame text-[14px] leading-[105%] text-[rgba(16,16,16,0.5)]";

export function TariffCard({ tariff }: { tariff: Tariff }) {
  const providerName = (tariff as Tariff & { provider?: { name: string } }).provider?.name ?? "—";
  const category = "Жилое, кв.";

  return (
    <Card className="rounded-[20px] p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-[rgba(16,16,16,0.25)]" />
          <span className="w-2 h-2 rounded-full bg-[rgba(16,16,16,0.25)]" />
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-[rgba(16,16,16,0.25)]" />
          <span className="w-2 h-2 rounded-full bg-[rgba(16,16,16,0.25)]" />
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <div>
          <p className={labelStyle}>Категория</p>
          <p className={valueStyle}>{category}</p>
        </div>
        <div>
          <p className={labelStyle}>Название опер.</p>
          <p className={valueStyle}>{providerName}</p>
        </div>
        <div>
          <p className={labelStyle}>Тарифный план</p>
          <p className={valueStyle}>{tariff.name}</p>
        </div>
      </div>

      <div className="h-px bg-[rgba(16,16,16,0.1)] max-w-[330px] my-3" />

      <div className="flex flex-col gap-[5px] mb-3">
        <div className="flex items-center min-h-[40px] gap-[9px]">
          <CheckCircleIcon />
          <div className="flex-1 min-w-0">
            <p className={featureText}>{tariff.speed ? `${tariff.speed} Мбит/сек` : "—"}</p>
            <p className={featureDesc}>Безлимитное соединение в квартире</p>
          </div>
        </div>
        <div className="flex items-center min-h-[40px] gap-[9px]">
          <CheckCircleIcon />
          <div className="flex-1 min-w-0">
            <p className={featureText}>{tariff.tvChannels ? `${tariff.tvChannels} каналов` : "—"}</p>
            <p className={featureDesc}>{tariff.hasTV ? "Телевидение" : " "}</p>
          </div>
        </div>
        <div className="flex items-center min-h-[40px] gap-[9px]">
          <CheckCircleIcon />
          <div className="flex-1 min-w-0">
            <p className={featureText}>
              {tariff.mobileGB != null
                ? tariff.mobileGB >= 999
                  ? "безлимит гигабайтов"
                  : `${tariff.mobileMinutes ?? 0} мин · ${tariff.mobileGB} гигабайтов`
                : "—"}
            </p>
            <p className={featureDesc}>{tariff.hasMobile ? "Мобильное соединение" : " "}</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-[rgba(16,16,16,0.1)] max-w-[330px] my-2" />

      <div className="font-frame text-[22px] leading-[115%] text-[#101010] mb-1">
        {tariff.price != null ? `${tariff.price} р./мес.` : "—"}
      </div>
      <div className={featureDesc + " mb-3"}>
        {tariff.connectionPrice === 0
          ? "Подключение от оператора за 0 р."
          : `Подключение от оператора за ${tariff.connectionPrice ?? "—"} р.`}
      </div>

      <div className="space-y-1.5 text-sm border-t border-[rgba(16,16,16,0.1)] pt-2">
        <div>
          <p className={labelStyle}>WI</p>
          <p className={valueStyle}>{tariff.speed ? `${tariff.speed} Мбит/сек` : "—"}</p>
        </div>
        <div>
          <p className={labelStyle}>TV</p>
          <p className={valueStyle}>{tariff.tvChannels ? `${tariff.tvChannels} кан` : "—"}</p>
        </div>
        <div>
          <p className={labelStyle}>SIM</p>
          <p className={valueStyle}>{tariff.mobileGB != null ? String(tariff.mobileGB) : "—"}</p>
        </div>
        <div>
          <p className={labelStyle}>Плата, мес.</p>
          <p className={valueStyle}>{tariff.price != null ? `${tariff.price} р.` : "—"}</p>
        </div>
      </div>
    </Card>
  );
}
