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

/** Белая галочка в круге с чёрным фоном (как в frontend modals) */
const WhiteCheckIcon = () => (
  <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
    <path d="M1 3L3 5L7 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
              onFocus={() => setValidationError(false)}
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
              onFocus={() => setValidationError(false)}
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
              onFocus={() => setValidationError(false)}
              placeholder="Название тарифного плана"
              frameStyle
              invalid={validationError}
            />
          </div>
        </div>

        {/* Строка 2: Название населённого пункта (регионы из БД) | WI | TV | SIM — ширина 320px как у оператора/тарифа */}
        <div style={{ display: "flex", gap, marginBottom: gap }}>
          <div style={{ width: 320, flexShrink: 0 }}>
            <Select
              value={regionId}
              options={regionOptions}
              onChange={(v) => { setRegionId(v != null ? Number(v) : null); setValidationError(false); }}
              onFocus={() => setValidationError(false)}
              placeholder="Название населённого пункта"
              frameStyle
              invalid={validationError}
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
                border: validationError ? "1px solid #FF3030" : fieldBorder,
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
                  background: checked ? "#101010" : "transparent",
                }}
              >
                {checked ? <WhiteCheckIcon /> : null}
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
                  border: validationError ? "1px solid #FF3030" : fieldBorder,
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
                    background: checked ? "#101010" : "transparent",
                  }}
                >
                  {checked ? <WhiteCheckIcon /> : null}
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
              onChange={(v) => { setConnectionPrice(v); setValidationError(false); }}
              onFocus={() => setValidationError(false)}
              placeholder="Плата, подк."
              frameStyle
              invalid={validationError}
              frameOpenHeight={DROPDOWN_OPEN_HEIGHT}
            />
          </div>
          <div style={{ ...FIELD_155, flexShrink: 0 }}>
            <Select
              value={monthlyPrice}
              options={monthlyPriceOptions}
              onChange={(v) => { setMonthlyPrice(v); setValidationError(false); }}
              onFocus={() => setValidationError(false)}
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
              onChange={(v) => { setPayout(v); setValidationError(false); }}
              onFocus={() => setValidationError(false)}
              placeholder="Выплата"
              frameStyle
              invalid={validationError}
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
              width: 150,
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
