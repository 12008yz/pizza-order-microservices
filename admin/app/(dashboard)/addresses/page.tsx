"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AddressCard } from "@/components/addresses/AddressCard";
import { Button } from "@/components/ui/Button";
import { fetchRegions, fetchCities, fetchStreets, fetchBuildings } from "@/lib/api";
import type { Building } from "@/types";

interface Region {
  id: number;
  name: string;
}
interface City {
  id: number;
  name: string;
}
interface Street {
  id: number;
  name: string;
}

export default function AddressesPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [streets, setStreets] = useState<Street[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [regionId, setRegionId] = useState<number | "">("");
  const [cityId, setCityId] = useState<number | "">("");
  const [streetId, setStreetId] = useState<number | "">("");
  const [loadingBuildings, setLoadingBuildings] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchRegions()
      .then((res: { success?: boolean; data?: Region[] }) => {
        if (cancelled) return;
        setRegions(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!regionId) {
      setCities([]);
      setCityId("");
      setStreets([]);
      setStreetId("");
      return;
    }
    let cancelled = false;
    fetchCities(regionId as number)
      .then((res: { success?: boolean; data?: City[] }) => {
        if (cancelled) return;
        setCities(Array.isArray(res?.data) ? res.data : []);
        setCityId("");
        setStreets([]);
        setStreetId("");
      })
      .catch(() => setCities([]));
    return () => { cancelled = true; };
  }, [regionId]);

  useEffect(() => {
    if (!cityId) {
      setStreets([]);
      setStreetId("");
      return;
    }
    let cancelled = false;
    fetchStreets(cityId as number)
      .then((res: { success?: boolean; data?: Street[] }) => {
        if (cancelled) return;
        setStreets(Array.isArray(res?.data) ? res.data : []);
        setStreetId("");
      })
      .catch(() => setStreets([]));
    return () => { cancelled = true; };
  }, [cityId]);

  const loadBuildings = () => {
    if (!streetId) return;
    setLoadingBuildings(true);
    setBuildings([]);
    fetchBuildings(streetId as number)
      .then((list) => {
        setBuildings(Array.isArray(list) ? (list as Building[]) : []);
      })
      .catch(() => setBuildings([]))
      .finally(() => setLoadingBuildings(false));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Регион</label>
          <select
            className="rounded-input border border-border px-3 py-2 text-sm min-w-[200px]"
            value={regionId}
            onChange={(e) => setRegionId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Выберите регион</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Город</label>
          <select
            className="rounded-input border border-border px-3 py-2 text-sm min-w-[200px]"
            value={cityId}
            onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : "")}
            disabled={!regionId}
          >
            <option value="">Выберите город</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Улица</label>
          <select
            className="rounded-input border border-border px-3 py-2 text-sm min-w-[200px]"
            value={streetId}
            onChange={(e) => setStreetId(e.target.value ? Number(e.target.value) : "")}
            disabled={!cityId}
          >
            <option value="">Выберите улицу</option>
            {streets.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <Button onClick={loadBuildings} disabled={!streetId || loadingBuildings}>
          {loadingBuildings ? "Загрузка..." : "Показать здания"}
        </Button>
        </div>
        <Link
          href="/addresses/new"
          className="rounded-input bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          + Проникновение
        </Link>
      </div>

      {loadingBuildings && <p className="text-muted-foreground">Загрузка зданий...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {buildings.map((b) => (
          <AddressCard key={b.id} building={b} />
        ))}
      </div>
      {!loadingBuildings && buildings.length === 0 && streetId && (
        <p className="text-muted-foreground">Зданий по выбранной улице не найдено</p>
      )}
    </div>
  );
}
