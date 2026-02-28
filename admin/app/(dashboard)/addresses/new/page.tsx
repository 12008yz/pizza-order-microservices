"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Select, type SelectOption } from "@/components/ui/Select";
import { fetchRegions, fetchCities, fetchStreets, fetchProviders } from "@/lib/api";
import { locationApi } from "@/lib/api";

const fontFamily = "'TT Firs Neue', sans-serif";
const fieldBorder = "1px solid rgba(16, 16, 16, 0.5)";
const fieldHeight = 50;
const fieldRadius = 10;
/** Круг 16×16 справа у полей (как в макете Group 7734) */
const FIELD_CIRCLE_SIZE = 16;
const FIELD_CIRCLE_BORDER = "1px solid rgba(16, 16, 16, 0.5)";

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
  const [validationError, setValidationError] = useState(false);

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
      setValidationError(true);
      return;
    }
    setValidationError(false);
    setSaving(true);
    try {
      await locationApi.post("/api/locations/buildings", {
        streetId: Number(streetId),
        number: houseNumber.trim(),
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Ошибка сохранения";
      setError(String(msg ?? "Ошибка"));
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div style={{ fontFamily }}>
        <p style={{ color: "var(--success)" }}>Адрес успешно добавлен.</p>
        <Link href="/addresses" style={{ fontSize: 14, color: "#101010", textDecoration: "underline" }}>
          К базе адресов
        </Link>
      </div>
    );
  }

  const fieldStyle: React.CSSProperties = {
    boxSizing: "border-box",
    width: "100%",
    height: fieldHeight,
    minHeight: fieldHeight,
    border: fieldBorder,
    borderRadius: fieldRadius,
    paddingLeft: 15,
    paddingRight: 40,
    fontFamily,
    fontWeight: 400,
    fontSize: 16,
    lineHeight: "125%",
    color: "#101010",
    background: "#FFFFFF",
    outline: "none",
  };

  const selectStyle: React.CSSProperties = {
    ...fieldStyle,
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='6' viewBox='0 0 12 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 5L11 1' stroke='%23101010' stroke-width='1.5'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 15px center",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        position: "relative",
        boxSizing: "border-box",
        width: 915,
        height: 380,
        background: "#FFFFFF",
        border: "1px solid rgba(16, 16, 16, 0.15)",
        backdropFilter: "blur(7.5px)",
        borderRadius: 20,
        padding: "20px 20px 20px",
        fontFamily,
      }}
    >
      {/* Заголовок и закрытие: круг 30×30 по центру маленьких кругов (центр 16px = 8px от края, 30px = 15px от края → сдвиг влево на 7px) */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <h1
          style={{
            fontFamily,
            fontWeight: 400,
            fontSize: 16,
            lineHeight: "185%",
            color: "#101010",
            margin: 0,
          }}
        >
          Проникновение
        </h1>
        <div style={{ marginRight: -7 }}>
          <Link
            href="/addresses"
            style={{
              boxSizing: "border-box",
              width: 30,
              height: 30,
              minWidth: 30,
              minHeight: 30,
              border: "1px solid rgba(16, 16, 16, 0.15)",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#FFFFFF",
              textDecoration: "none",
            }}
            aria-label="Закрыть"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Название населённого пункта + круг справа (от круга до поля 37px) */}
        <div style={{ display: "flex", alignItems: "center", gap: 37, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0, maxWidth: 868 }}>
            <Select
              value={regionId === "" ? null : regionId}
              options={regions.map((r) => ({ value: r.id, label: r.name }))}
              onChange={(v) => { setRegionId(v != null ? Number(v) : ""); setValidationError(false); }}
              placeholder="Название населённого пункта"
              frameStyle
              invalid={validationError}
            />
          </div>
          <span
            style={{
              boxSizing: "border-box",
              width: FIELD_CIRCLE_SIZE,
              height: FIELD_CIRCLE_SIZE,
              minWidth: FIELD_CIRCLE_SIZE,
              minHeight: FIELD_CIRCLE_SIZE,
              border: FIELD_CIRCLE_BORDER,
              borderRadius: "50%",
              flexShrink: 0,
            }}
            aria-hidden
          />
        </div>

        {/* Название пространства населённого пункта + круг справа (от круга до поля 37px): сначала город, после выбора города — улица */}
        <div style={{ display: "flex", alignItems: "center", gap: 37, marginBottom: 10 }}>
          {!cityId ? (
            <div style={{ flex: 1, minWidth: 0, maxWidth: 868 }}>
              <Select
                value={cityId === "" ? null : cityId}
                options={cities.map((c) => ({ value: c.id, label: c.name }))}
                onChange={(v) => { setCityId(v != null ? Number(v) : ""); setValidationError(false); }}
                placeholder="Название пространства населённого пункта"
                disabled={!regionId}
                frameStyle
                invalid={validationError}
              />
            </div>
          ) : (
            <div style={{ flex: 1, minWidth: 0, maxWidth: 868 }}>
              <Select
                value={streetId === "" ? null : streetId}
                options={streets.map((s) => ({ value: s.id, label: s.name }))}
                onChange={(v) => { setStreetId(v != null ? Number(v) : ""); setValidationError(false); }}
                placeholder="Название пространства населённого пункта"
                frameStyle
                invalid={validationError}
              />
            </div>
          )}
          <span
            style={{
              boxSizing: "border-box",
              width: FIELD_CIRCLE_SIZE,
              height: FIELD_CIRCLE_SIZE,
              minWidth: FIELD_CIRCLE_SIZE,
              minHeight: FIELD_CIRCLE_SIZE,
              border: FIELD_CIRCLE_BORDER,
              borderRadius: "50%",
              flexShrink: 0,
            }}
            aria-hidden
          />
        </div>

        {/* Ряд: Категория, Номеры, Подъезды, Полеты, Квартиры */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div style={{ width: 155, flexShrink: 0 }}>
            <Select
              value={category}
              options={[
                { value: "residential", label: "Жилое, кв." },
                { value: "private", label: "Частный сектор" },
                { value: "office", label: "Офис" },
              ]}
              onChange={(v) => setCategory(v != null ? String(v) : "residential")}
              placeholder="Категория"
              frameStyle
              invalid={validationError}
            />
          </div>
          <div style={{ width: 155, flexShrink: 0 }}>
            <Select
              value={houseNumber || null}
              options={[
                { value: "", label: "—" },
                ...Array.from({ length: 30 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
                ...(houseNumber && !/^\d+$/.test(houseNumber) ? [{ value: houseNumber, label: houseNumber }] : []),
              ]}
              onChange={(v) => { setHouseNumber(v != null ? String(v) : ""); setValidationError(false); }}
              placeholder="Номеры"
              frameStyle
              invalid={validationError}
              showAddNew
            />
          </div>
          <div style={{ width: 155, flexShrink: 0 }}>
            <Select
              value={entrances || null}
              options={[
                { value: "", label: "—" },
                ...Array.from({ length: 20 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
              ]}
              onChange={(v) => setEntrances(v != null ? String(v) : "")}
              placeholder="Подъезды"
              frameStyle
              invalid={validationError}
              showAddNew
            />
          </div>
          <div style={{ width: 155, flexShrink: 0 }}>
            <Select
              value={floors || null}
              options={[
                { value: "", label: "—" },
                ...Array.from({ length: 25 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
              ]}
              onChange={(v) => setFloors(v != null ? String(v) : "")}
              placeholder="Полеты"
              frameStyle
              invalid={validationError}
              showAddNew
            />
          </div>
          <div style={{ width: 155, flexShrink: 0 }}>
            <Select
              value={apartments || null}
              options={[
                { value: "", label: "—" },
                ...Array.from({ length: 50 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
              ]}
              onChange={(v) => setApartments(v != null ? String(v) : "")}
              placeholder="Квартиры"
              frameStyle
              invalid={validationError}
              showAddNew
            />
          </div>
        </div>

        {/* Ряд: Категория (второй) + Краткое описание */}
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 155, flexShrink: 0 }}>
            <Select
              value={providerId === "" ? null : providerId}
              options={providers.map((p) => ({ value: p.id, label: p.name }))}
              onChange={(v) => setProviderId(v != null ? Number(v) : "")}
              placeholder="Категория"
              frameStyle
            />
          </div>
          <div style={{ flex: 1, minWidth: 0, maxWidth: 650 }}>
            <input
              type="text"
              style={{ ...fieldStyle, paddingRight: 16, width: "100%" }}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Краткое описание"
            />
          </div>
        </div>

        {error && !validationError && (
          <p style={{ fontSize: 14, color: "var(--error)", marginBottom: 12 }}>{error}</p>
        )}

        {/* Кнопка Проникновение: по макету Group 7711 — при невалидной форме opacity 0.15, "+" в белом круге, серый "+", текст белый */}
        <button
          type="submit"
          disabled={saving}
          style={{
            boxSizing: "border-box",
            width: 200,
            height: 50,
            background: "#101010",
            border: "1px solid rgba(16, 16, 16, 0.15)",
            borderRadius: 10,
            color: "#FFFFFF",
            fontFamily,
            fontWeight: 400,
            fontSize: 16,
            lineHeight: "315%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: validationError ? 0.15 : saving ? 0.7 : 1,
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#FFFFFF",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden style={{ display: "block" }}>
              <path
                d="M8 2v12M2 8h12"
                stroke={validationError ? "rgba(16, 16, 16, 0.5)" : "#101010"}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>Проникновение</span>
        </button>
      </form>
    </div>
  );
}
