"use client";

import { Card } from "@/components/ui/Card";
import type { Tariff } from "@/types";

export function TariffCard({ tariff }: { tariff: Tariff }) {
  const providerName = (tariff as Tariff & { provider?: { name: string } }).provider?.name ?? "—";
  const category = "Жилое, кв.";

  return (
    <Card>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Категория</p>
          <p className="truncate">{category}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Название опер.</p>
          <p className="truncate">{providerName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Тарифный план</p>
          <p className="truncate">{tariff.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">WI</p>
          <p className="truncate">{tariff.speed ? `${tariff.speed} Мбит/сек` : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">TV</p>
          <p className="truncate">{tariff.tvChannels ? `${tariff.tvChannels} кан` : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">SIM</p>
          <p className="truncate">{tariff.mobileGB != null ? String(tariff.mobileGB) : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Плата, мес.</p>
          <p className="truncate">{tariff.price != null ? `${tariff.price} р.` : "—"}</p>
        </div>
      </div>
    </Card>
  );
}
