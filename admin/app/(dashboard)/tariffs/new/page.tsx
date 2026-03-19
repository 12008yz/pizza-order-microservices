"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { fetchProviders, fetchTariffs, fetchRegions, createProvider, createTariff } from "@/lib/api";
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

/**
 * Анимированная “доп” окружность вокруг выбранной технологии.
 * Ранее у вас были проблемы с расхождением/двойным рендером — тут рисуем ровно 2 круга:
 * 1) r=17 (статичный)
 * 2) r=18 (анимируем stroke-dashoffset 0..360)
 */
function AnimatedProgressRing() {
  const cx = 18;
  const cy = 18;
  const rStatic = 9.5;
  const rAnimated = 11;

  const strokeWidth = 1;
  const circumference = 2 * Math.PI * rAnimated;
  const [dashOffset, setDashOffset] = useState(circumference);

  useEffect(() => {
    const id = requestAnimationFrame(() => setDashOffset(0));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <svg
      width={36}
      height={36}
      viewBox="0 0 36 36"
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden
    >
      {/* Круг 1: статичный */}
      <circle
        cx={cx}
        cy={cy}
        r={rStatic}
        fill="none"
        stroke="#101010"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Круг 2: анимированный */}
      <circle
        cx={cx}
        cy={cy}
        r={rAnimated}
        fill="none"
        stroke="#101010"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 700ms ease-out",
          transformOrigin: "50% 50%",
          transform: "rotate(-90deg)",
        }}
      />
    </svg>
  );
}

function AnimatedProgressRing1() {
  const cx = 18;
  const cy = 18;
  const r = 9.5;
  const strokeWidth = 1;
  const circumference = 2 * Math.PI * r;
  const [dashOffset, setDashOffset] = useState(circumference);

  useEffect(() => {
    const id = requestAnimationFrame(() => setDashOffset(0));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <svg
      width={36}
      height={36}
      viewBox="0 0 36 36"
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#101010"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 700ms ease-out",
          transformOrigin: "50% 50%",
          transform: "rotate(-90deg)",
        }}
      />
    </svg>
  );
}

/** Ширина полей Категория, Плата подк., Плата мес., Выплата; при открытии высота выпадающего списка 170px */
const FIELD_155 = { width: 155 };
const DROPDOWN_OPEN_HEIGHT = 170;

const CATEGORY_OPTIONS = [
  { value: "sim", label: "SIM" },
  { value: "residential", label: "Жилое, кв." },
  { value: "commercial", label: "Офис" },
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

/** Моковые данные для работы без сервера */
const MOCK_PROVIDERS: Provider[] = [
  { id: 1, name: "МТС" },
  { id: 2, name: "Ростелеком" },
  { id: 3, name: "Мегафон" },
  { id: 4, name: "Марьино.net" },
];

const MOCK_REGIONS: Region[] = [
  { id: 1, name: "Москва" },
  { id: 2, name: "Московская обл." },
  { id: 3, name: "Санкт-Петербург" },
  { id: 4, name: "Ленинградская обл." },
];

const MOCK_TARIFFS: Tariff[] = [
  {
    id: 1,
    name: "Базовый",
    description: "",
    providerId: 1,
    speed: 100,
    price: 500,
    connectionPrice: 0,
    technology: "fiber",
    hasTV: true,
    tvChannels: 55,
    hasMobile: false,
    mobileMinutes: null,
    mobileGB: null,
    mobileSMS: null,
    promoPrice: null,
    promoMonths: null,
    promoText: null,
    isActive: true,
  },
  {
    id: 2,
    name: "Оптимальный",
    description: "",
    providerId: 1,
    speed: 300,
    price: 699,
    connectionPrice: 99,
    technology: "fiber",
    hasTV: true,
    tvChannels: 55,
    hasMobile: false,
    mobileMinutes: null,
    mobileGB: null,
    mobileSMS: null,
    promoPrice: null,
    promoMonths: null,
    promoText: null,
    isActive: true,
  },
];

const OFFER_STORAGE_KEY = "tariffs_new_offer";
const OFFER_DRAFT_STORAGE_KEY = "tariffs_new_offer_draft";

export default function NewTariffPage() {
  const router = useRouter();
  // Стартовое состояние без предустановленных значений — всё выбирает пользователь
  const [category, setCategory] = useState("");
  const [providerId, setProviderId] = useState<number | "">("");
  const [tariffId, setTariffId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [regionId, setRegionId] = useState<number | null>(null);
  const [hasWi, setHasWi] = useState(false);
  const [hasTv, setHasTv] = useState(false);
  const [hasSim, setHasSim] = useState(false);
  const [technology, setTechnology] = useState<string>("");
  const [activeService, setActiveService] = useState<"wi" | "tv" | "sim" | null>(null);
  const [serviceTechnology, setServiceTechnology] = useState<{
    wi: string | null;
    tv: string | null;
    sim: string | null;
  }>({
    wi: null,
    tv: null,
    sim: null,
  });
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
    fetchProviders()
      .then((res: { data?: Provider[] }) => setProviders(Array.isArray(res?.data) && res.data.length > 0 ? res.data : MOCK_PROVIDERS))
      .catch(() => setProviders(MOCK_PROVIDERS));
    fetchTariffs()
      .then((res: unknown) => {
        const data = (res as { data?: Tariff[] })?.data;
        setTariffs(Array.isArray(data) && data.length > 0 ? data : MOCK_TARIFFS);
      })
      .catch(() => setTariffs(MOCK_TARIFFS));
    fetchRegions()
      .then((res: { data?: Region[] }) => setRegions(Array.isArray(res?.data) && res.data.length > 0 ? res.data : MOCK_REGIONS))
      .catch(() => setRegions(MOCK_REGIONS));
  }, []);

  // Восстановление черновика из sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(OFFER_DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        category?: string;
        providerId?: number | "";
        tariffId?: number | null;
        name?: string;
        regionId?: number | null;
        hasWi?: boolean;
        hasTv?: boolean;
        hasSim?: boolean;
        technology?: string;
        connectionPrice?: number | string | null;
        monthlyPrice?: number | string | null;
        payout?: number | string | null;
        serviceTechnology?: { wi?: string | null; tv?: string | null; sim?: string | null };
      };
      if (draft.category != null) setCategory(draft.category);
      if (draft.providerId !== undefined) setProviderId(draft.providerId);
      if (draft.tariffId !== undefined) setTariffId(draft.tariffId);
      if (draft.name != null) setName(draft.name);
      if (draft.regionId !== undefined) setRegionId(draft.regionId);
      if (draft.hasWi !== undefined) setHasWi(draft.hasWi);
      if (draft.hasTv !== undefined) setHasTv(draft.hasTv);
      if (draft.hasSim !== undefined) setHasSim(draft.hasSim);
      if (draft.technology != null) setTechnology(draft.technology);
      if (draft.connectionPrice !== undefined) setConnectionPrice(draft.connectionPrice);
      if (draft.monthlyPrice !== undefined) setMonthlyPrice(draft.monthlyPrice);
      if (draft.payout !== undefined) setPayout(draft.payout);
      if (draft.serviceTechnology) {
        setServiceTechnology({
          wi: draft.serviceTechnology.wi ?? null,
          tv: draft.serviceTechnology.tv ?? null,
          sim: draft.serviceTechnology.sim ?? null,
        });
      }
    } catch {
      // игнорируем битые данные
    }
  }, []);

  // Сохранение черновика в sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const draft = {
      category,
      providerId,
      tariffId,
      name,
      regionId,
      hasWi,
      hasTv,
      hasSim,
      technology,
      connectionPrice,
      monthlyPrice,
      payout,
      serviceTechnology,
    };
    try {
      window.sessionStorage.setItem(OFFER_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // если sessionStorage недоступен — просто ничего не делаем
    }
  }, [
    category,
    providerId,
    tariffId,
    name,
    regionId,
    hasWi,
    hasTv,
    hasSim,
    technology,
    connectionPrice,
    monthlyPrice,
    payout,
    serviceTechnology,
  ]);

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
    if (connectionPrice != null && connectionPrice !== "") {
      const n = Number(connectionPrice);
      if (!Number.isNaN(n)) set.add(n);
    }
    return Array.from(set).sort((a, b) => a - b).map((n) => ({ value: n, label: String(n) }));
  }, [tariffs, defaultPriceSteps, connectionPrice]);

  /** Уникальные значения «Плата мес.» из тарифов; если тарифов нет — базовый набор */
  const monthlyPriceOptions = useMemo(() => {
    const set = new Set<number>(tariffs.map((t) => t.price).filter((n) => n != null));
    defaultPriceSteps.forEach((n) => set.add(n));
    if (monthlyPrice != null && monthlyPrice !== "") {
      const n = Number(monthlyPrice);
      if (!Number.isNaN(n)) set.add(n);
    }
    return Array.from(set).sort((a, b) => a - b).map((n) => ({ value: n, label: String(n) }));
  }, [tariffs, defaultPriceSteps, monthlyPrice]);

  /** Опции «Выплата»: из тарифов нет поля, используем типовой диапазон 0–5000 */
  const payoutOptions = useMemo(() => {
    const step = 100;
    const opts: { value: number; label: string }[] = [{ value: 0, label: "0" }];
    for (let i = step; i <= 5000; i += step) opts.push({ value: i, label: String(i) });
    if (payout != null && payout !== "") {
      const n = Number(payout);
      if (!Number.isNaN(n) && !opts.some((o) => o.value === n)) {
        opts.push({ value: n, label: String(n) });
      }
    }
    return opts;
  }, [payout]);

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

    // Технологию для сохранения берём из привязок: сначала WI, потом TV, потом SIM
    const primaryTechnology =
      serviceTechnology.wi ??
      serviceTechnology.tv ??
      serviceTechnology.sim ??
      technology;

    // Если отмечены WI, TV или SIM — сохраняем данные и открываем соответствующие шаги вместо создания тарифа
    if (hasWi || hasTv || hasSim) {
      const offer = {
        category,
        providerId: Number(providerId),
        name: name.trim(),
        regionId,
        regionName,
        connectionPrice: connPrice,
        monthlyPrice: monthPrice,
        payout: payout != null ? Number(payout) : null,
        technology: primaryTechnology,
        hasWi,
        hasTv,
        hasSim,
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem(OFFER_STORAGE_KEY, JSON.stringify(offer));
      }
      if (hasWi) {
        router.push("/tariffs/new/wi");
        return;
      }
      if (hasTv) {
        router.push("/tariffs/new/tv");
        return;
      }
      if (hasSim) {
        router.push("/tariffs/new/sim");
        return;
      }
    }

    setSaving(true);
    try {
      await createTariff({
        name: name.trim(),
        providerId: Number(providerId),
        description: regionName,
        speed: hasWi ? 100 : 0,
        price: monthPrice,
        connectionPrice: connPrice,
        technology: primaryTechnology === "DOCSIS" ? "cable" : "fiber",
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
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div style={{ ...FIELD_155, flexShrink: 0 }}>
            <Select
              value={category || null}
              options={CATEGORY_OPTIONS}
              onChange={(v) => { setCategory(v != null ? String(v) : ""); setValidationError(false); }}
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
              frameOpenHeight={DROPDOWN_OPEN_HEIGHT}
              searchable
              showAddNew
              addNewLabel="Новое включить"
              onAddNew={async () => {
                const v = typeof window !== "undefined" ? window.prompt("Введите название оператора") : null;
                if (v == null || v.trim() === "") return;
                try {
                  const res = await createProvider({ name: v.trim() });
                  const id =
                    (res as { data?: { id?: number } })?.data?.id ??
                    (res as { id?: number })?.id;
                  fetchProviders().then((res: { data?: Provider[] }) => setProviders(Array.isArray(res?.data) ? res.data : []));
                  if (typeof id === "number") setProviderId(id);
                } catch {
                  fetchProviders().then((res: { data?: Provider[] }) => setProviders(Array.isArray(res?.data) ? res.data : []));
                }
              }}
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
              frameOpenHeight={DROPDOWN_OPEN_HEIGHT}
              searchable
              showAddNew
              addNewLabel="Новое включить"
              onAddNew={() => {
                setTariffId(null);
                setName("");
              }}
            />
          </div>
        </div>

        {/* Строка 2: Название населённого пункта (регионы из БД) | WI | TV | SIM — ширина 320px как у оператора/тарифа */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 15,
          }}
        >
          <div style={{ width: 320, flexShrink: 0 }}>
            <Select
              value={regionId}
              options={regionOptions}
              onChange={(v) => { setRegionId(v != null ? Number(v) : null); setValidationError(false); }}
              onFocus={() => setValidationError(false)}
              placeholder="Название населённого пункта"
              frameStyle
              invalid={validationError}
              searchable
              showAddNew
              frameOpenHeight={DROPDOWN_OPEN_HEIGHT}
              addNewLabel="Новое включить"
              onAddNew={() => {
                if (typeof window === "undefined") return;
                const v = window.prompt("Введите название населённого пункта");
                if (!v || !v.trim()) return;
                const name = v.trim();
                const id = -(regions.length + 1);
                // Локальный регион только в рамках формы
                const next = { id, name };
                setRegions((prev) => [...prev, next]);
                setRegionId(id);
                setValidationError(false);
              }}
            />
          </div>
          {[
            { key: "wi", checked: hasWi, onChange: setHasWi, label: "WI" },
            { key: "tv", checked: hasTv, onChange: setHasTv, label: "TV" },
            { key: "sim", checked: hasSim, onChange: setHasSim, label: "SIM" },
          ].map(({ key, checked, onChange, label }) => {
            const mappedTech = serviceTechnology[key as "wi" | "tv" | "sim"];
            const isFrozen = !!mappedTech;
            const textColor = !checked
              ? "rgba(16, 16, 16, 0.5)"
              : isFrozen
              ? "rgba(16, 16, 16, 0.5)"
              : "#101010";

            return (
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
                  onChange={(e) => {
                    const next = e.target.checked;

                    // Если чекбокс снимаем — очищаем и привязку технологии для этого сервиса
                    if (!next) {
                      setServiceTechnology((prev) => ({
                        ...prev,
                        [key]: null,
                      }) as typeof prev);
                      if (activeService === key) {
                        setActiveService(null);
                      }
                    } else {
                      setActiveService(key as "wi" | "tv" | "sim");
                    }

                    onChange(next);
                  }}
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
                <span style={{ color: textColor }}>{label}</span>
              </label>
            );
          })}
        </div>

        {/* Строка 3: FTTX · 4 | FTTX · 8 | GPON | DOCSIS (привязка к выбранному WI/TV/SIM) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 10,
          }}
        >
          {TECH_OPTIONS.map((opt) => {
            const assignedCount =
              [serviceTechnology.wi, serviceTechnology.tv, serviceTechnology.sim].filter((v) => v === opt.value).length;
            const isAssigned =
              serviceTechnology.wi === opt.value ||
              serviceTechnology.tv === opt.value ||
              serviceTechnology.sim === opt.value;

            const checked = isAssigned;
            // WI (1-е оборудование) -> только галочка
            // TV (2-е) -> первый кружок (статичный)
            // SIM (3-е) -> второй кружок (анимированный), при этом первый остаётся
            const showRing1Only = checked && assignedCount === 2;
            const showRing2 = checked && assignedCount >= 3;
            const textColor = isAssigned
              ? "rgba(16, 16, 16, 0.5)"
              : checked
              ? "#101010"
              : "rgba(16, 16, 16, 0.5)";

            return (
              <label
                key={opt.value}
                style={{
                  ...blockStyle,
                  width: 155,
                  flexShrink: 0,
                  cursor: activeService ? "pointer" : "default",
                  gap: 8,
                  border: validationError ? "1px solid #FF3030" : fieldBorder,
                  opacity: activeService ? 1 : 0.5,
                }}
                onClick={() => {
                  if (!activeService) return;
                  setServiceTechnology((prev) => ({
                    ...prev,
                    [activeService]: prev[activeService] === opt.value ? null : opt.value,
                  }));
                  setTechnology(opt.value);
                  setActiveService(null);
                }}
              >
                <span
                  style={{
                    position: "relative",
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
                    zIndex: 1,
                  }}
                >
                  {showRing1Only ? (
                    <AnimatedProgressRing1 key={`${opt.value}-ring1-${assignedCount}`} />
                  ) : null}
                  {showRing2 ? <AnimatedProgressRing key={`${opt.value}-ring2-${assignedCount}`} /> : null}
                  {checked ? <WhiteCheckIcon /> : null}
                </span>
                <span style={{ color: textColor }}>{opt.label}</span>
              </label>
            );
          })}
        </div>

        {/* Строка 4: Плата, подк. | Плата, мес. | Выплата (при открытии каждый 155×170) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 10,
          }}
        >
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
              searchable
              showAddNew
              onAddNew={() => {
                if (typeof window === "undefined") return;
                const v = window.prompt("Введите плату за подключение");
                if (!v || !v.trim()) return;
                const n = Number(v.replace(",", "."));
                if (Number.isNaN(n)) return;
                setConnectionPrice(n);
                setValidationError(false);
              }}
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
              searchable
              showAddNew
              onAddNew={() => {
                if (typeof window === "undefined") return;
                const v = window.prompt("Введите ежемесячную плату");
                if (!v || !v.trim()) return;
                const n = Number(v.replace(",", "."));
                if (Number.isNaN(n)) return;
                setMonthlyPrice(n);
                setValidationError(false);
              }}
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
              searchable
              showAddNew
              onAddNew={() => {
                if (typeof window === "undefined") return;
                const v = window.prompt("Введите размер выплаты");
                if (!v || !v.trim()) return;
                const n = Number(v.replace(",", "."));
                if (Number.isNaN(n)) return;
                setPayout(n);
                setValidationError(false);
              }}
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
                  stroke="#101010"
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
