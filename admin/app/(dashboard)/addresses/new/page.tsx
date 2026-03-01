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
/** Круг 16×16 справа у полей (как в макете Group 7734); при выборе — синяя галочка */
const FIELD_CIRCLE_SIZE = 16;
const FIELD_CIRCLE_BORDER = "1px solid rgba(16, 16, 16, 0.5)";

const SuccessCheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="M8 0C6.41775 0 4.87103 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346625 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9978 5.87895 15.1542 3.84542 13.6544 2.34562C12.1546 0.845814 10.121 0.00223986 8 0ZM11.5123 6.58923L7.20462 10.8969C7.14747 10.9541 7.0796 10.9995 7.00489 11.0305C6.93018 11.0615 6.8501 11.0774 6.76923 11.0774C6.68836 11.0774 6.60828 11.0615 6.53358 11.0305C6.45887 10.9995 6.391 10.9541 6.33385 10.8969L4.48769 9.05077C4.37222 8.9353 4.30735 8.77868 4.30735 8.61538C4.30735 8.45208 4.37222 8.29547 4.48769 8.18C4.60317 8.06453 4.75978 7.99966 4.92308 7.99966C5.08638 7.99966 5.24299 8.06453 5.35846 8.18L6.76923 9.59154L10.6415 5.71846C10.6987 5.66128 10.7666 5.61593 10.8413 5.58499C10.916 5.55404 10.9961 5.53812 11.0769 5.53812C11.1578 5.53812 11.2379 5.55404 11.3126 5.58499C11.3873 5.61593 11.4551 5.66128 11.5123 5.71846C11.5695 5.77564 11.6148 5.84351 11.6458 5.91822C11.6767 5.99292 11.6927 6.07299 11.6927 6.15385C11.6927 6.2347 11.6767 6.31477 11.6458 6.38947C11.6148 6.46418 11.5695 6.53205 11.5123 6.58923Z"
      fill="#0075FF"
    />
  </svg>
);

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
        minHeight: 380,
        background: "#FFFFFF",
        border: "1px solid rgba(16, 16, 16, 0.15)",
        backdropFilter: "blur(7.5px)",
        borderRadius: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 20,
        paddingBottom: 20,
        fontFamily,
      }}
    >
      {/* Заголовок и закрытие: круг 30×30; правый столбец 30px для выравнивания с нижними кругами */}
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
        <div style={{ width: 30, minWidth: 30, display: "flex", justifyContent: "center" }}>
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

      <form className="address-form" onSubmit={handleSubmit}>
        {/* Название населённого пункта + круг справа (колонка 30px; gap 30 — правый край поля совпадает с рядом Категория/Краткое описание) */}
        <div style={{ display: "flex", alignItems: "center", gap: 30, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Select
              value={regionId === "" ? null : regionId}
              options={regions.map((r) => ({ value: r.id, label: r.name }))}
              onChange={(v) => { setRegionId(v != null ? Number(v) : ""); setValidationError(false); }}
              placeholder="Название населённого пункта"
              frameStyle
              invalid={validationError}
            />
          </div>
          <div style={{ width: 30, minWidth: 30, display: "flex", justifyContent: "center", flexShrink: 0 }}>
            <span
              style={{
                boxSizing: "border-box",
                width: FIELD_CIRCLE_SIZE,
                height: FIELD_CIRCLE_SIZE,
                minWidth: FIELD_CIRCLE_SIZE,
                minHeight: FIELD_CIRCLE_SIZE,
                border: regionId !== "" ? "none" : FIELD_CIRCLE_BORDER,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-hidden
            >
              {regionId !== "" ? <SuccessCheckIcon /> : null}
            </span>
          </div>
        </div>

        {/* Название пространства населённого пункта + круг справа (колонка 30px; gap 30 — правый край совпадает с нижними рядами) */}
        <div style={{ display: "flex", alignItems: "center", gap: 30, marginBottom: 10 }}>
          {!cityId ? (
            <div style={{ flex: 1, minWidth: 0 }}>
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
            <div style={{ flex: 1, minWidth: 0 }}>
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
          <div style={{ width: 30, minWidth: 30, display: "flex", justifyContent: "center", flexShrink: 0 }}>
            <span
              style={{
                boxSizing: "border-box",
                width: FIELD_CIRCLE_SIZE,
                height: FIELD_CIRCLE_SIZE,
                minWidth: FIELD_CIRCLE_SIZE,
                minHeight: FIELD_CIRCLE_SIZE,
                border: (cityId !== "" || streetId !== "") ? "none" : FIELD_CIRCLE_BORDER,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-hidden
            >
              {(cityId !== "" || streetId !== "") ? <SuccessCheckIcon /> : null}
            </span>
          </div>
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
              className={validationError ? "invalid-field" : undefined}
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
