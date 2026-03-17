"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Select } from "@/components/ui/Select";
import { fetchRegions, fetchCities, fetchStreets, fetchProviders } from "@/lib/api";
import { locationApi } from "@/lib/api";

const fontFamily = "'TT Firs Neue', sans-serif";
const fieldBorder = "1px solid rgba(16, 16, 16, 0.5)";
const fieldHeight = 50;
const fieldRadius = 10;
/** Круг 16×16 справа у полей; голубой и галочка — только после клика по кругу (сохранение адреса для новых проникновений) */
const FIELD_CIRCLE_SIZE = 16;
const FIELD_CIRCLE_BORDER = "1px solid rgba(16, 16, 16, 0.5)";
const PINNED_ADDRESS_STORAGE_KEY = "admin-pinned-address";

const WhiteCheckIcon = () => (
  <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
    <path d="M1 3L3 5L7 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

/** Моковые данные для работы без сервера */
const MOCK_REGIONS: Region[] = [
  { id: 1, name: "Москва" },
  { id: 2, name: "Московская обл." },
  { id: 3, name: "Санкт-Петербург" },
  { id: 4, name: "Ленинградская обл." },
];

const MOCK_CITIES: City[] = [
  { id: 1, name: "гор. Москва, Московская обл." },
  { id: 2, name: "Химки" },
  { id: 3, name: "Подольск" },
  { id: 4, name: "Балашиха" },
];

const MOCK_STREETS: Street[] = [
  { id: 1, name: "наб. Кремлевская" },
  { id: 2, name: "ул. Тверская" },
  { id: 3, name: "ул. Арбат" },
  { id: 4, name: "пр. Мира" },
];

interface PinnedAddress {
  regionId: number;
  cityId: number | null;
  streetId: number | null;
}

function loadPinnedAddress(): PinnedAddress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PINNED_ADDRESS_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { regionId?: number; cityId?: number | null; streetId?: number | null };
    if (p.regionId == null) return null;
    return {
      regionId: p.regionId,
      cityId: p.cityId ?? null,
      streetId: p.streetId ?? null,
    };
  } catch {
    return null;
  }
}

function savePinnedAddress(pinned: PinnedAddress | null) {
  if (typeof window === "undefined") return;
  if (!pinned) {
    window.localStorage.removeItem(PINNED_ADDRESS_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(PINNED_ADDRESS_STORAGE_KEY, JSON.stringify(pinned));
}

export default function NewAddressPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [streets, setStreets] = useState<Street[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [regionId, setRegionId] = useState<number | "">("");
  const [cityId, setCityId] = useState<number | "">("");
  const [streetId, setStreetId] = useState<number | "">("");
  /** Закреплённый адрес: голубой круг только при совпадении с текущим выбором; сохраняется по клику на круг */
  const [pinned, setPinned] = useState<PinnedAddress | null>(null);
  const [restoredOnce, setRestoredOnce] = useState(false);
  // По умолчанию ничего не выбрано — пользователь сам задаёт значения
  const [category, setCategory] = useState("");
  const [houseNumber, setHouseNumber] = useState<string | null>(null);
  const [entrances, setEntrances] = useState<string | null>(null);
  const [floors, setFloors] = useState<string | null>(null);
  const [apartments, setApartments] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<number | "">("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState(false);
  /** Значения cityId/streetId для восстановления после загрузки списков; задаётся в эффекте восстановления, читается в эффектах городов/улиц */
  const pendingRestoreRef = useRef<{ cityId: number | null; streetId: number | null } | null>(null);

  useEffect(() => {
    setPinned(loadPinnedAddress());
  }, []);

  useEffect(() => {
    fetchRegions()
      .then((res: { data?: Region[] }) => setRegions(Array.isArray(res?.data) && res.data.length > 0 ? res.data : MOCK_REGIONS))
      .catch(() => setRegions(MOCK_REGIONS));
    fetchProviders().then((res: { data?: Provider[] }) => setProviders(Array.isArray(res?.data) ? res.data : []));
  }, []);

  /** Восстановление закреплённого адреса после загрузки регионов; сохраняем cityId/streetId в ref для последующего восстановления */
  useEffect(() => {
    if (restoredOnce || regions.length === 0 || !pinned) return;
    setRegionId(pinned.regionId);
    pendingRestoreRef.current = {
      cityId: pinned.cityId,
      streetId: pinned.streetId,
    };
    setRestoredOnce(true);
  }, [pinned, regions.length, restoredOnce]);

  useEffect(() => {
    if (!regionId) {
      setCities([]);
      setCityId("");
      pendingRestoreRef.current = null;
      return;
    }
    const cityToRestore =
      pendingRestoreRef.current?.cityId != null ? pendingRestoreRef.current.cityId : "";
    fetchCities(regionId as number)
      .then((res: { data?: City[] }) => {
        const list = Array.isArray(res?.data) && res.data.length > 0 ? res.data : MOCK_CITIES;
        setCities(list);
        setCityId(cityToRestore);
        if (!cityToRestore) {
          setStreets([]);
          setStreetId("");
          pendingRestoreRef.current = null;
        }
      })
      .catch(() => {
        setCities(MOCK_CITIES);
        setCityId("");
        setStreets([]);
        setStreetId("");
        pendingRestoreRef.current = null;
      });
  }, [regionId]);

  useEffect(() => {
    if (!cityId) {
      setStreets([]);
      setStreetId("");
      return;
    }
    const streetToRestore =
      pendingRestoreRef.current?.streetId != null ? pendingRestoreRef.current.streetId : "";
    fetchStreets(cityId as number)
      .then((res: { data?: Street[] }) => {
        const list = Array.isArray(res?.data) && res.data.length > 0 ? res.data : MOCK_STREETS;
        setStreets(list);
        setStreetId(streetToRestore);
        pendingRestoreRef.current = null;
      })
      .catch(() => {
        setStreets(MOCK_STREETS);
        pendingRestoreRef.current = null;
      });
  }, [cityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!streetId || !houseNumber || !houseNumber.trim()) {
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

  return (
    <div
      style={{
        position: "relative",
        boxSizing: "border-box",
        width: 915,
        minHeight: 380,
        background: "#FFFFFF",
        backdropFilter: "blur(7.5px)",
        borderRadius: 20,
        border: "none",
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 20,
        paddingBottom: 19,
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
        {/* Название населённого пункта + круг: голубой и галочка только после клика (сохранение для новых проникновений) */}
        <div style={{ display: "flex", alignItems: "center", gap: 30, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Select
              value={regionId === "" ? null : regionId}
              options={regions.map((r) => ({ value: r.id, label: r.name }))}
              onChange={(v) => { setRegionId(v != null ? Number(v) : ""); setValidationError(false); }}
              onFocus={() => setValidationError(false)}
              placeholder="Название населённого пункта"
              frameStyle
              invalid={validationError}
            />
          </div>
          <div style={{ width: 30, minWidth: 30, display: "flex", justifyContent: "center", flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => {
                if (regionId === "") return;
                const isCurrentlyPinned =
                  pinned != null && regionId === pinned.regionId && pinned.cityId == null && pinned.streetId == null;
                if (isCurrentlyPinned) {
                  setPinned(null);
                  savePinnedAddress(null);
                  return;
                }
                const next: PinnedAddress = { regionId: regionId as number, cityId: null, streetId: null };
                setPinned(next);
                savePinnedAddress(next);
              }}
              style={{
                boxSizing: "border-box",
                width: FIELD_CIRCLE_SIZE,
                height: FIELD_CIRCLE_SIZE,
                minWidth: FIELD_CIRCLE_SIZE,
                minHeight: FIELD_CIRCLE_SIZE,
                border: pinned != null && regionId === pinned.regionId ? "none" : FIELD_CIRCLE_BORDER,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: pinned != null && regionId === pinned.regionId ? "#3b82f6" : "transparent",
                cursor: regionId !== "" ? "pointer" : "default",
                padding: 0,
              }}
              aria-label={pinned != null && regionId === pinned.regionId ? "Закреплённый регион" : "Закрепить регион для новых проникновений"}
            >
              {pinned != null && regionId === pinned.regionId ? <WhiteCheckIcon /> : null}
            </button>
          </div>
        </div>

        {/* Название пространства населённого пункта + круг: голубой только после клика (сохранить город/улицу для новых проникновений) */}
        <div style={{ display: "flex", alignItems: "center", gap: 30, marginBottom: 10 }}>
          {!cityId ? (
            <div style={{ flex: 1, minWidth: 0 }}>
              <Select
                value={cityId === "" ? null : cityId}
                options={cities.map((c) => ({ value: c.id, label: c.name }))}
                onChange={(v) => { setCityId(v != null ? Number(v) : ""); setValidationError(false); }}
                onFocus={() => setValidationError(false)}
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
                onFocus={() => setValidationError(false)}
                placeholder="Название пространства населённого пункта"
                displayWhenEmpty={cities.find((c) => c.id === cityId)?.name}
                frameStyle
                invalid={validationError}
              />
            </div>
          )}
          <div style={{ width: 30, minWidth: 30, display: "flex", justifyContent: "center", flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => {
                if (regionId === "" || (cityId === "" && streetId === "")) return;
                const isSecondFieldPinned =
                  pinned != null &&
                  (pinned.cityId != null || pinned.streetId != null) &&
                  pinned.regionId === regionId &&
                  (pinned.cityId ?? "") === cityId &&
                  (pinned.streetId ?? "") === streetId;
                if (isSecondFieldPinned) {
                  setPinned(null);
                  savePinnedAddress(null);
                  return;
                }
                const next: PinnedAddress = {
                  regionId: regionId as number,
                  cityId: cityId !== "" ? (cityId as number) : null,
                  streetId: streetId !== "" ? (streetId as number) : null,
                };
                setPinned(next);
                savePinnedAddress(next);
              }}
              style={{
                boxSizing: "border-box",
                width: FIELD_CIRCLE_SIZE,
                height: FIELD_CIRCLE_SIZE,
                minWidth: FIELD_CIRCLE_SIZE,
                minHeight: FIELD_CIRCLE_SIZE,
                border:
                  pinned != null &&
                  (pinned.cityId != null || pinned.streetId != null) &&
                  pinned.regionId === regionId &&
                  (pinned.cityId ?? "") === cityId &&
                  (pinned.streetId ?? "") === streetId
                    ? "none"
                    : FIELD_CIRCLE_BORDER,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  pinned != null &&
                  (pinned.cityId != null || pinned.streetId != null) &&
                  pinned.regionId === regionId &&
                  (pinned.cityId ?? "") === cityId &&
                  (pinned.streetId ?? "") === streetId
                    ? "#3b82f6"
                    : "transparent",
                cursor: regionId !== "" && (cityId !== "" || streetId !== "") ? "pointer" : "default",
                padding: 0,
              }}
              aria-label={
                pinned != null &&
                (pinned.cityId != null || pinned.streetId != null) &&
                pinned.regionId === regionId &&
                (pinned.cityId ?? "") === cityId &&
                (pinned.streetId ?? "") === streetId
                  ? "Закреплённый адрес"
                  : "Закрепить адрес для новых проникновений"
              }
            >
              {pinned != null &&
              (pinned.cityId != null || pinned.streetId != null) &&
              pinned.regionId === regionId &&
              (pinned.cityId ?? "") === cityId &&
              (pinned.streetId ?? "") === streetId ? (
                <WhiteCheckIcon />
              ) : null}
            </button>
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
              value={category || null}
              options={[
                { value: "residential", label: "Жилое, кв." },
                { value: "private", label: "Частный сектор" },
                { value: "office", label: "Офис" },
              ]}
              onChange={(v) => setCategory(v != null ? String(v) : "")}
              onFocus={() => setValidationError(false)}
              placeholder="Категория"
              frameStyle
              invalid={validationError}
            />
          </div>
          <div style={{ width: 155, flexShrink: 0 }}>
            <Select
              value={houseNumber === null ? null : houseNumber}
              options={[
                { value: "", label: "Неизвестно" },
                ...Array.from({ length: 30 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
                ...(houseNumber && !/^\d+$/.test(houseNumber) ? [{ value: houseNumber, label: houseNumber }] : []),
              ]}
              onChange={(v) => { setHouseNumber(v === null ? null : String(v)); setValidationError(false); }}
              onFocus={() => setValidationError(false)}
              placeholder="Номеры"
              frameStyle
              frameOpenHeight={170}
              invalid={validationError}
              showAddNew
              searchable
              onAddNew={() => { const v = window.prompt("Введите номер дома"); if (v != null && v.trim() !== "") setHouseNumber(v.trim()); }}
            />
          </div>
          <div style={{ width: 155, flexShrink: 0 }}>
            <Select
              value={entrances === null ? null : entrances}
              options={[
                { value: "", label: "Неизвестно" },
                ...Array.from({ length: 20 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
                ...(entrances && (parseInt(entrances, 10) > 20 || !/^\d+$/.test(entrances)) ? [{ value: entrances, label: entrances }] : []),
              ]}
              onChange={(v) => setEntrances(v === null ? null : String(v))}
              onFocus={() => setValidationError(false)}
              placeholder="Подъезды"
              frameStyle
              frameOpenHeight={170}
              invalid={validationError}
              showAddNew
              searchable
              onAddNew={() => { const v = window.prompt("Введите количество подъездов"); if (v != null && v.trim() !== "") setEntrances(v.trim()); }}
            />
          </div>
          <div style={{ width: 155, flexShrink: 0 }}>
            <Select
              value={floors === null ? null : floors}
              options={[
                { value: "", label: "Неизвестно" },
                ...Array.from({ length: 25 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
                ...(floors && (parseInt(floors, 10) > 25 || !/^\d+$/.test(floors)) ? [{ value: floors, label: floors }] : []),
              ]}
              onChange={(v) => setFloors(v === null ? null : String(v))}
              onFocus={() => setValidationError(false)}
              placeholder="Полеты"
              frameStyle
              frameOpenHeight={170}
              invalid={validationError}
              showAddNew
              searchable
              onAddNew={() => { const v = window.prompt("Введите количество этажей"); if (v != null && v.trim() !== "") setFloors(v.trim()); }}
            />
          </div>
          <div style={{ width: 155, flexShrink: 0 }}>
            <Select
              value={apartments === null ? null : apartments}
              options={[
                { value: "", label: "Неизвестно" },
                ...Array.from({ length: 50 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
                ...(apartments && (parseInt(apartments, 10) > 50 || !/^\d+$/.test(apartments)) ? [{ value: apartments, label: apartments }] : []),
              ]}
              onChange={(v) => setApartments(v === null ? null : String(v))}
              onFocus={() => setValidationError(false)}
              placeholder="Квартиры"
              frameStyle
              frameOpenHeight={170}
              invalid={validationError}
              showAddNew
              searchable
              onAddNew={() => { const v = window.prompt("Введите количество квартир"); if (v != null && v.trim() !== "") setApartments(v.trim()); }}
            />
          </div>
        </div>

        {/* Ряд: Категория (второй) + Краткое описание — без зазора под правым полем; отступ до кнопки 20px */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 155, flexShrink: 0 }}>
            <Select
              value={providerId === "" ? null : providerId}
              options={providers.map((p) => ({ value: p.id, label: p.name }))}
              onChange={(v) => setProviderId(v != null ? Number(v) : "")}
              onFocus={() => setValidationError(false)}
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
              onFocus={() => setValidationError(false)}
              placeholder="Краткое описание"
            />
          </div>
        </div>

        {error && !validationError && (
          <p style={{ fontSize: 14, color: "var(--error)", marginBottom: 12 }}>{error}</p>
        )}

        {/* Кнопка Проникновение: по макету Group 7711 — при невалидной форме opacity 0.15, "+" в белом круге, серый "+", текст белый; отступ сверху 0, чтобы до белого блока было 20px */}
        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: 0,
            marginBottom: 0,
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
