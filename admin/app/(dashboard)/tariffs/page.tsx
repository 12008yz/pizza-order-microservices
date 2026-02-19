"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TariffCard } from "@/components/tariffs/TariffCard";
import { fetchTariffs } from "@/lib/api";
import type { Tariff } from "@/types";

export default function TariffsPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTariffs()
      .then((res: unknown) => {
        if (cancelled) return;
        const data = res as { success?: boolean; data?: Tariff[] };
        setTariffs(Array.isArray(data?.data) ? data.data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Ошибка загрузки");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return <p className="text-error">{error}</p>;
  }
  if (loading) {
    return <p className="text-muted-foreground">Загрузка тарифов...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href="/tariffs/new"
          className="rounded-input bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          + Предложение
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tariffs.map((t) => (
          <TariffCard key={t.id} tariff={t} />
        ))}
      </div>
      {tariffs.length === 0 && (
        <p className="text-muted-foreground">Тарифов пока нет</p>
      )}
    </div>
  );
}
