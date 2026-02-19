"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { fetchRegions, fetchCities, fetchStreets, fetchProviders } from "@/lib/api";
import { locationApi } from "@/lib/api";

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
interface Provider {
  id: number;
  name: string;
}

export default function NewAddressPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [streets, setStreets] = useState<Street[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [regionId, setRegionId] = useState<number | "">("");
  const [cityId, setCityId] = useState<number | "">("");
  const [streetId, setStreetId] = useState<number | "">("");
  const [category, setCategory] = useState("residential");
  const [houseNumber, setHouseNumber] = useState("");
  const [entrances, setEntrances] = useState("");
  const [floors, setFloors] = useState("");
  const [apartments, setApartments] = useState("");
  const [providerId, setProviderId] = useState<number | "">("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchRegions().then((res: { data?: Region[] }) => setRegions(Array.isArray(res?.data) ? res.data : []));
    fetchProviders().then((res: { data?: Provider[] }) => setProviders(Array.isArray(res?.data) ? res.data : []));
  }, []);

  useEffect(() => {
    if (!regionId) {
      setCities([]);
      setCityId("");
      return;
    }
    fetchCities(regionId as number).then((res: { data?: City[] }) => {
      setCities(Array.isArray(res?.data) ? res.data : []);
      setCityId("");
      setStreets([]);
      setStreetId("");
    });
  }, [regionId]);

  useEffect(() => {
    if (!cityId) {
      setStreets([]);
      setStreetId("");
      return;
    }
    fetchStreets(cityId as number).then((res: { data?: Street[] }) => {
      setStreets(Array.isArray(res?.data) ? res.data : []);
      setStreetId("");
    });
  }, [cityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!streetId || !houseNumber.trim()) {
      setError("Укажите улицу и номер дома");
      return;
    }
    setSaving(true);
    try {
      await locationApi.post("/api/locations/buildings", {
        streetId: Number(streetId),
        number: houseNumber.trim(),
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : "Ошибка сохранения";
      setError(String(msg ?? "Ошибка"));
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <p className="text-success">Адрес успешно добавлен.</p>
        <Link href="/addresses" className="text-sm text-foreground underline">К базе адресов</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold mb-4">Проникновение</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Населённый пункт</label>
          <select
            className="w-full rounded-input border border-border px-3 py-2 text-sm"
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
            className="w-full rounded-input border border-border px-3 py-2 text-sm"
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
          <label className="block text-xs text-muted-foreground mb-1">Пространство (улица)</label>
          <select
            className="w-full rounded-input border border-border px-3 py-2 text-sm"
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
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Категория</label>
            <select
              className="rounded-input border border-border px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="residential">Жилое, кв.</option>
              <option value="commercial">Нежилое</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Номер дома</label>
            <Input
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="д. 9 к 6"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Подъезды</label>
            <Input
              type="number"
              min={0}
              value={entrances}
              onChange={(e) => setEntrances(e.target.value)}
              placeholder="—"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Этажи</label>
            <Input
              type="number"
              min={0}
              value={floors}
              onChange={(e) => setFloors(e.target.value)}
              placeholder="—"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Квартиры</label>
            <Input
              type="number"
              min={0}
              value={apartments}
              onChange={(e) => setApartments(e.target.value)}
              placeholder="888 кв."
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Провайдер</label>
          <select
            className="w-full rounded-input border border-border px-3 py-2 text-sm"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">—</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Комментарий</label>
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ключи от тех. этажа..."
          />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? "Сохранение..." : "+ Проникновение"}
        </Button>
      </form>
    </div>
  );
}
