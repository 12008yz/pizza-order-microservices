"use client";

import { Card } from "@/components/ui/Card";
import type { Building } from "@/types";

interface AddressCardProps {
  building: Building & { street?: { name: string; city?: { name: string } } };
}

const labelStyle = "font-frame text-xs leading-[125%] text-[rgba(16,16,16,0.5)]";
const valueStyle = "font-frame text-sm truncate text-[#101010]";

export function AddressCard({ building }: AddressCardProps) {
  const locationName = building.street?.city?.name ?? "—";
  const spaceName = building.street?.name ?? "—";
  const category = building.type === "residential" ? "Жилое, кв." : "Нежилое";

  return (
    <Card className="rounded-[20px] border-[rgba(16,16,16,0.1)]">
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
          <p className={labelStyle}>Насел. пункт</p>
          <p className={valueStyle}>{locationName}</p>
        </div>
        <div>
          <p className={labelStyle}>Пространство</p>
          <p className={valueStyle}>{spaceName}</p>
        </div>
        <div>
          <p className={labelStyle}>Номер дома</p>
          <p className={valueStyle}>д. {building.number}</p>
        </div>
        <div>
          <p className={labelStyle}>Всего подъездов</p>
          <p className={valueStyle}>{building.entrances ?? "—"}</p>
        </div>
        <div>
          <p className={labelStyle}>Всего полётов</p>
          <p className={valueStyle}>—</p>
        </div>
        <div>
          <p className={labelStyle}>Всего квар.</p>
          <p className={valueStyle}>{building.apartments != null ? `${building.apartments} кв.` : "—"}</p>
        </div>
      </div>
    </Card>
  );
}
