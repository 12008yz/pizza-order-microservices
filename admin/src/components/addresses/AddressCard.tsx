"use client";

import { Card } from "@/components/ui/Card";
import type { Building } from "@/types";

interface AddressCardProps {
  building: Building & { street?: { name: string; city?: { name: string } } };
}

export function AddressCard({ building }: AddressCardProps) {
  const locationName = building.street?.city?.name ?? "—";
  const spaceName = building.street?.name ?? "—";
  const category = building.type === "residential" ? "Жилое, кв." : "Нежилое";

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
          <p className="text-xs text-muted-foreground">Насел. пункт</p>
          <p className="truncate">{locationName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Пространство</p>
          <p className="truncate">{spaceName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Номер дома</p>
          <p className="truncate">д. {building.number}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Всего подъездов</p>
          <p className="truncate">{building.entrances ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Всего полётов</p>
          <p className="truncate">—</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Всего квар.</p>
          <p className="truncate">{building.apartments != null ? `${building.apartments} кв.` : "—"}</p>
        </div>
      </div>
    </Card>
  );
}
