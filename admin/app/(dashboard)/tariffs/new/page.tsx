"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Select } from "@/components/ui/Select";
import { fetchProviders, fetchTariffs, fetchRegions } from "@/lib/api";
import { providerApi } from "@/lib/api";
import type { Tariff } from "@/types";

const fontFamily = "'TT Firs Neue', sans-serif";
const fieldBorder = "1px solid rgba(16, 16, 16, 0.5)";
const fieldHeight = 50;
const fieldRadius = 10;
/** Круг 16×16 и галочка как в Проникновении */
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

/** Ширина полей Категория, Плата подк., Плата мес., Выплата; при открытии высота выпадающего списка 170px */
const FIELD_155 = { width: 155 };
const DROPDOWN_OPEN_HEIGHT = 170;

const CATEGORY_OPTIONS = [
  { value: "sim", label: "SIM" },
  { value: "residential", label: "Жилое, кв." },
  { value: "commercial", label: "Нежилое" },
  { value: "private", label: "Жилое, час." },
];

const TECH_OPTIONS = [
  { value: "FTTX · 4", label: "FTTX · 4" },
  { value: "FTTX · 8", label: "FTTX · 8" },
  { value: "GPON", label: "GPON" },
  { value: "DOCSIS", label: "DOCSIS" },
];

interface Provider {
  id: number;
  name: string;
}

interface Region {
  id: number;
  name: string;
}

export default function NewTariffPage() {
  const [category, setCategory] = useState("residential");
  const [providerId, setProviderId] = useState<number | "">("");
  const [tariffId, setTariffId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [regionId, setRegionId] = useState<number | null>(null);
  const [hasWi, setHasWi] = useState(true);
  const [hasTv, setHasTv] = useState(true);
  const [hasSim, setHasSim] = useState(false);
  const [technology, setTechnology] = useState<string>("FTTX · 8");
  const [connectionPrice, setConnectionPrice] = useState<string | number | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState<string | number | null>(null);
  const [payout, setPayout] = useState<string | number | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState(false);

  useEffect(() => {
    fetchProviders().then((res: { data?: Provider[] }) => setProviders(Array.isArray(res?.data) ? res.data : []));
    fetchTariffs()
      .then((res: unknown) => {
        const data = (res as { data?: Tariff[] })?.data;
        setTariffs(Array.isArray(data) ? data : []);
      })
      .catch(() => setTariffs([]));
    fetchRegions().then((res: { data?: Region[] }) => setRegions(Array.isArray(res?.data) ? res.data : []));
  }, []);

  /** Опции для «Название тарифного плана» из БД */
  const tariffOptions = useMemo(
    () => tariffs.map((t) => ({ value: t.id, label: t.name })),
    [tariffs]
  );

  /** Опции для «Название населённого пункта» (регионы) из БД */
  const regionOptions = useMemo(
    () => regions.map((r) => ({ value: r.id, label: r.name })),
    [regions]
  );

  /** Базовый набор сумм, если в БД пусто */
  const defaultPriceSteps = useMemo(() => {
    const arr: number[] = [0];
    for (let i = 100; i <= 3000; i += 100) arr.push(i);
    return arr;
  }, []);

  /** Уникальные значения «Плата подк.» из тарифов; если тарифов нет — базовый набор */
  const connectionPriceOptions = useMemo(() => {
    const set = new Set<number>(tariffs.map((t) => t.connectionPrice).filter((n) => n != null));
    defaultPriceSteps.forEach((n) => set.add(n));
    return Array.from(set).sort((a, b) => a - b).map((n) => ({ value: n, label: String(n) }));
  }, [tariffs, defaultPriceSteps]);

  /** Уникальные значения «Плата мес.» из тарифов; если тарифов нет — базовый набор */
  const monthlyPriceOptions = useMemo(() => {
    const set = new Set<number>(tariffs.map((t) => t.price).filter((n) => n != null));
    defaultPriceSteps.forEach((n) => set.add(n));
    return Array.from(set).sort((a, b) => a - b).map((n) => ({ value: n, label: String(n) }));
  }, [tariffs, defaultPriceSteps]);

  /** Опции «Выплата»: из тарифов нет поля, используем типовой диапазон 0–5000 */
  const payoutOptions = useMemo(() => {
    const step = 100;
    const opts: { value: number; label: string }[] = [{ value: 0, label: "0" }];
    for (let i = step; i <= 5000; i += step) opts.push({ value: i, label: String(i) });
    return opts;
  }, []);

  /** При выборе тарифа подставляем данные из БД */
  const handleTariffSelect = (id: number | null) => {
    setTariffId(id);
    setValidationError(false);
    if (id == null) {
      setName("");
      return;
    }
    const t = tariffs.find((x) => x.id === id);
    if (!t) return;
    setName(t.name);
    setProviderId(t.providerId ?? "");
    setConnectionPrice(t.connectionPrice ?? null);
    setMonthlyPrice(t.price ?? null);
    setTechnology(t.technology === "cable" ? "DOCSIS" : "FTTX · 8");
    setHasTv(t.hasTV);
    setHasSim(t.hasMobile);
    setHasWi(t.speed > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const regionName = regionId != null ? regions.find((r) => r.id === regionId)?.name ?? "" : "";
    const connPrice = connectionPrice != null ? Number(connectionPrice) : 0;
    const monthPrice = monthlyPrice != null ? Number(monthlyPrice) : 0;
    const payoutNum = payout != null ? Number(payout) : 0;
    if (!providerId || !name.trim() || monthlyPrice == null) {
      setValidationError(true);
      return;
    }
    setValidationError(false);
    setSaving(true);
    try {
      await providerApi.post("/api/tariffs", {
        name: name.trim(),
        providerId: Number(providerId),
        description: regionName,
        speed: hasWi ? 100 : 0,
        price: monthPrice,
        connectionPrice: connPrice,
        technology: technology === "DOCSIS" ? "cable" : "fiber",
        hasTV: hasTv,
        tvChannels: hasTv ? 55 : null,
        hasMobile: hasSim,
        mobileMinutes: null,
        mobileGB: null,
        mobileSMS: null,
        isActive: true,
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
        <p style={{ color: "var(--success)" }}>Тариф создан.</p>
        <Link href="/tariffs" style={{ fontSize: 14, color: "#101010", textDecoration: "underline" }}>
          К базе планов
        </Link>
      </div>
    );
  }

  /** Единый блок как в макете: 50px, скругление 10px, рамка */
  const blockStyle: React.CSSProperties = {
    boxSizing: "border-box",
    height: fieldHeight,
    minHeight: fieldHeight,
    border: fieldBorder,
    borderRadius: fieldRadius,
    paddingLeft: 15,
    paddingRight: 15,
    fontFamily,
    fontWeight: 400,
    fontSize: 16,
    lineHeight: "125%",
    color: "#101010",
    background: "#FFFFFF",
    outline: "none",
    display: "flex",
    alignItems: "center",
  };

  const gap = 10;

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
        border: "1px solid rgba(16, 16, 16, 0.15)",
        padding: 20,
        fontFamily,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <h1 style={{ fontFamily, fontWeight: 400, fontSize: 16, lineHeight: "185%", color: "#101010", margin: 0 }}>
          Предложение
        </h1>
        <Link
          href="/tariffs"
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

      <form className="address-form" onSubmit={handleSubmit}>
        {/* Строка 1: Категория (при открытии 155×170) | Название оператора | Название тарифного плана */}
        <div style={{ display: "flex", gap, marginBottom: gap }}>
          <div style={{ ...FIELD_155, flexShrink: 0 }}>
            <Select
              value={category}
              options={CATEGORY_OPTIONS}
              onChange={(v) => { setCategory(v != null ? String(v) : "residential"); setValidationError(false); }}
              placeholder="Категория"
              frameStyle
              invalid={validationError}
              frameOpenHeight={DROPDOWN_OPEN_HEIGHT}
            />
          </div>
          <div style={{ width: 320, flexShrink: 0 }}>
            <Select
              value={providerId === "" ? null : providerId}
              options={providers.map((p) => ({ value: p.id, label: p.name }))}
              onChange={(v) => { setProviderId(v != null ? Number(v) : ""); setValidationError(false); }}
              placeholder="Название оператора"
              frameStyle
              invalid={validationError}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0, maxWidth: 320 }}>
            <Select
              value={tariffId}
              options={tariffOptions}
              onChange={(v) => handleTariffSelect(v != null ? Number(v) : null)}
              placeholder="Название тарифного плана"
              frameStyle
              invalid={validationError}
            />
          </div>
        </div>

        {/* Строка 2: Название населённого пункта (регионы из БД) | WI | TV | SIM */}
        <div style={{ display: "flex", gap, marginBottom: gap }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Select
              value={regionId}
              options={regionOptions}
              onChange={(v) => { setRegionId(v != null ? Number(v) : null); setValidationError(false); }}
              placeholder="Название населённого пункта"
              frameStyle
            />
          </div>
          {[
            { key: "wi", checked: hasWi, onChange: setHasWi, label: "WI" },
            { key: "tv", checked: hasTv, onChange: setHasTv, label: "TV" },
            { key: "sim", checked: hasSim, onChange: setHasSim, label: "SIM" },
          ].map(({ key, checked, onChange, label }) => (
            <label
              key={key}
              style={{
                ...blockStyle,
                width: 155,
                flexShrink: 0,
                cursor: "pointer",
                gap: 8,
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                style={{ position: "absolute", opacity: 0, width: 0, height: 0, margin: 0 }}
                aria-label={label}
              />
              <span
                style={{
                  boxSizing: "border-box",
                  width: FIELD_CIRCLE_SIZE,
                  height: FIELD_CIRCLE_SIZE,
                  minWidth: FIELD_CIRCLE_SIZE,
                  minHeight: FIELD_CIRCLE_SIZE,
                  border: checked ? "none" : FIELD_CIRCLE_BORDER,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {checked ? <SuccessCheckIcon /> : null}
              </span>
              <span style={{ color: "rgba(16, 16, 16, 0.5)" }}>{label}</span>
            </label>
          ))}
        </div>

        {/* Строка 3: FTTX · 4 | FTTX · 8 | GPON | DOCSIS (те же круги и галочка) */}
        <div style={{ display: "flex", gap, marginBottom: gap }}>
          {TECH_OPTIONS.map((opt) => {
            const checked = technology === opt.value;
            return (
              <label
                key={opt.value}
                style={{
                  ...blockStyle,
                  width: 155,
                  flexShrink: 0,
                  cursor: "pointer",
                  gap: 8,
                }}
              >
                <input
                  type="radio"
                  name="tech"
                  checked={checked}
                  onChange={() => setTechnology(opt.value)}
                  style={{ position: "absolute", opacity: 0, width: 0, height: 0, margin: 0 }}
                  aria-label={opt.label}
                />
                <span
                  style={{
                    boxSizing: "border-box",
                    width: FIELD_CIRCLE_SIZE,
                    height: FIELD_CIRCLE_SIZE,
                    minWidth: FIELD_CIRCLE_SIZE,
                    minHeight: FIELD_CIRCLE_SIZE,
                    border: checked ? "none" : FIELD_CIRCLE_BORDER,
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {checked ? <SuccessCheckIcon /> : null}
                </span>
                <span style={{ color: "rgba(16, 16, 16, 0.5)" }}>{opt.label}</span>
              </label>
            );
          })}
        </div>

        {/* Строка 4: Плата, подк. | Плата, мес. | Выплата (при открытии каждый 155×170) */}
        <div style={{ display: "flex", gap, marginBottom: 20 }}>
          <div style={{ ...FIELD_155, flexShrink: 0 }}>
            <Select
              value={connectionPrice}
              options={connectionPriceOptions}
              onChange={(v) => setConnectionPrice(v)}
              placeholder="Плата, подк."
              frameStyle
              frameOpenHeight={DROPDOWN_OPEN_HEIGHT}
            />
          </div>
          <div style={{ ...FIELD_155, flexShrink: 0 }}>
            <Select
              value={monthlyPrice}
              options={monthlyPriceOptions}
              onChange={(v) => { setMonthlyPrice(v); setValidationError(false); }}
              placeholder="Плата, мес."
              frameStyle
              invalid={validationError}
              frameOpenHeight={DROPDOWN_OPEN_HEIGHT}
            />
          </div>
          <div style={{ ...FIELD_155, flexShrink: 0 }}>
            <Select
              value={payout}
              options={payoutOptions}
              onChange={(v) => setPayout(v)}
              placeholder="Выплата"
              frameStyle
              frameOpenHeight={DROPDOWN_OPEN_HEIGHT}
            />
          </div>
        </div>

        {error && !validationError && (
          <p style={{ fontSize: 14, color: "var(--error)", marginBottom: 12 }}>{error}</p>
        )}

        {/* Кнопки: Назад | Далее (как в макете) */}
        <div style={{ display: "flex", gap, alignItems: "center" }}>
          <Link
            href="/tariffs"
            style={{
              boxSizing: "border-box",
              width: 50,
              height: 50,
              minWidth: 50,
              minHeight: 50,
              border: "1px solid rgba(16, 16, 16, 0.15)",
              borderRadius: 10,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#FFFFFF",
              textDecoration: "none",
              color: "#101010",
            }}
            aria-label="Назад"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M8 2L4 6L8 10" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
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
            <span>Далее</span>
          </button>
        </div>
      </form>
    </div>
  );
}
