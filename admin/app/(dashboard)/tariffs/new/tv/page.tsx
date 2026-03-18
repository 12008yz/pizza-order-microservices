"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { createTariff } from "@/lib/api";

const OFFER_STORAGE_KEY = "tariffs_new_offer";

const fontFamily = "'TT Firs Neue', sans-serif";
const fieldBorder = "1px solid rgba(16, 16, 16, 0.5)";
const fieldHeight = 50;
const fieldRadius = 10;
const FIELD_CIRCLE_SIZE = 16;
const FIELD_CIRCLE_BORDER = "1px solid rgba(16, 16, 16, 0.5)";
const FIELD_155 = { width: 155 };
const DROPDOWN_OPEN_HEIGHT = 170;

const WhiteCheckIcon = () => (
  <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
    <path d="M1 3L3 5L7 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CATEGORY_OPTIONS = [
  { value: "residential", label: "Жилое, кв." },
  { value: "commercial", label: "Нежилое" },
  { value: "private", label: "Жилое, час." },
];

const PERFORMANCE_OPTIONS = [
  { value: 100, label: "100 Мбит/с" },
  { value: 200, label: "200 Мбит/с" },
  { value: 300, label: "300 Мбит/с" },
  { value: 500, label: "500 Мбит/с" },
  { value: 1000, label: "1000 Мбит/с" },
];

const PURCHASE_TYPE_OPTIONS = [
  { value: "purchase", label: "Покупка" },
  { value: "installment", label: "Рассрочка" },
  { value: "rent", label: "Аренда" },
];

const QUANTITY_OPTIONS = [
  { value: 1, label: "один экз." },
  { value: 2, label: "2 экз." },
  { value: 3, label: "3 экз." },
  { value: 4, label: "4 экз." },
  { value: 5, label: "5 экз." },
];

const CONNECTION_PRICE_OPTIONS = [
  { value: 0, label: "Бесплатно" },
  { value: 99, label: "99 р." },
  { value: 199, label: "199 р." },
  { value: 299, label: "299 р." },
];

const MONTHLY_PRICE_OPTIONS = [999, 1299, 1499].map((n) => ({ value: n, label: `${n} р./мес.` }));
const ONE_TIME_PRICE_OPTIONS = [99, 999, 1999].map((n) => ({ value: n, label: `${n} р.` }));

interface SavedOffer {
  providerId: number;
  name: string;
  regionName: string;
  connectionPrice: number;
  monthlyPrice: number;
  technology: string;
  hasWi: boolean;
  hasTv: boolean;
  hasSim: boolean;
}

export default function TvPage() {
  const router = useRouter();
  const [category, setCategory] = useState<string | number | null>("residential");
  const [performance, setPerformance] = useState<string | number | null>(null);
  const [purchaseType, setPurchaseType] = useState("installment");
  const [forPeriod, setForPeriod] = useState(false);
  const [quantity, setQuantity] = useState<string | number | null>(null);
  const [connectionPrice, setConnectionPrice] = useState<string | number | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState<string | number | null>(null);
  const [oneTimePrice, setOneTimePrice] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const gap = 10;

  const handleNext = async () => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem(OFFER_STORAGE_KEY) : null;
    if (!raw) {
      setError("Данные предложения не найдены. Вернитесь на шаг «Предложение».");
      return;
    }
    let offer: SavedOffer;
    try {
      offer = JSON.parse(raw) as SavedOffer;
    } catch {
      setError("Ошибка данных. Вернитесь на шаг «Предложение».");
      return;
    }
    setError("");
    // Если ещё есть шаг SIM — переходим на него, иначе создаём тариф
    if (offer.hasSim) {
      router.push("/tariffs/new/sim");
      return;
    }
    setSaving(true);
    try {
      await createTariff({
        name: offer.name,
        providerId: offer.providerId,
        description: offer.regionName,
        speed: offer.hasWi ? 100 : 0,
        price: offer.monthlyPrice,
        connectionPrice: offer.connectionPrice,
        technology: offer.technology === "DOCSIS" ? "cable" : "fiber",
        hasTV: true,
        tvChannels: 55,
        hasMobile: offer.hasSim,
        mobileMinutes: null,
        mobileGB: null,
        mobileSMS: null,
        isActive: true,
      });
      if (typeof window !== "undefined") sessionStorage.removeItem(OFFER_STORAGE_KEY);
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
      {/* Шапка: TV | закрыть */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: gap }}>
        <h1 style={{ fontFamily, fontWeight: 400, fontSize: 16, lineHeight: "185%", color: "#101010", margin: 0 }}>
          TV
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

      {/* Строка 1: Категория 155 | Производительность 320 */}
      <div style={{ display: "flex", gap, marginBottom: gap }}>
        <div style={{ ...FIELD_155, flexShrink: 0 }}>
          <Select
            value={category}
            options={CATEGORY_OPTIONS}
            onChange={(v) => setCategory(v)}
            placeholder="Категория"
            frameStyle
            frameOpenHeight={DROPDOWN_OPEN_HEIGHT}
          />
        </div>
        <div style={{ width: 320, flexShrink: 0 }}>
          <Select
            value={performance}
            options={PERFORMANCE_OPTIONS}
            onChange={(v) => setPerformance(v)}
            placeholder="Производительность"
            frameStyle
            frameOpenHeight={DROPDOWN_OPEN_HEIGHT}
          />
        </div>
      </div>

      {/* Строка 2: Покупка | Рассрочка | Аренда — по 155×50 */}
      <div style={{ display: "flex", gap, marginBottom: gap }}>
        {PURCHASE_TYPE_OPTIONS.map((opt) => {
          const checked = purchaseType === opt.value;
          return (
            <label
              key={opt.value}
              style={{
                ...blockStyle,
                width: 155,
                flexShrink: 0,
                cursor: "pointer",
                gap: 8,
                border: fieldBorder,
              }}
            >
              <input
                type="radio"
                name="purchaseType"
                checked={checked}
                onChange={() => setPurchaseType(opt.value)}
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

      {/* Строка 3: один чекбокс «На время» 155×50 */}
      <div style={{ display: "flex", gap, marginBottom: gap }}>
        <label
          style={{
            ...blockStyle,
            width: 155,
            flexShrink: 0,
            cursor: "pointer",
            gap: 8,
            border: fieldBorder,
          }}
        >
          <input
            type="checkbox"
            checked={forPeriod}
            onChange={(e) => setForPeriod(e.target.checked)}
            style={{ position: "absolute", opacity: 0, width: 0, height: 0, margin: 0 }}
            aria-label="На время"
          />
          <span
            style={{
              boxSizing: "border-box",
              width: FIELD_CIRCLE_SIZE,
              height: FIELD_CIRCLE_SIZE,
              minWidth: FIELD_CIRCLE_SIZE,
              minHeight: FIELD_CIRCLE_SIZE,
              border: forPeriod ? "none" : FIELD_CIRCLE_BORDER,
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              background: forPeriod ? "#101010" : "transparent",
            }}
          >
            {forPeriod ? <WhiteCheckIcon /> : null}
          </span>
          <span style={{ color: "rgba(16, 16, 16, 0.5)" }}>На время</span>
        </label>
      </div>

      {/* Строка 4: Количество 155 | Плата, подк. 155 | Плата, мес. 155 | Выплата 155 — с «Новое вкл...» */}
      <div style={{ display: "flex", gap, marginBottom: 20 }}>
        <div style={{ ...FIELD_155, flexShrink: 0 }}>
          <Select
            value={quantity}
            options={QUANTITY_OPTIONS}
            onChange={(v) => setQuantity(v)}
            placeholder="Количество"
            frameStyle
            frameOpenHeight={DROPDOWN_OPEN_HEIGHT}
            showAddNew
            onAddNew={() => {
              const v = typeof window !== "undefined" ? window.prompt("Введите количество") : null;
              if (v != null && v.trim() !== "") setQuantity(v.trim());
            }}
          />
        </div>
        <div style={{ ...FIELD_155, flexShrink: 0 }}>
          <Select
            value={connectionPrice}
            options={CONNECTION_PRICE_OPTIONS}
            onChange={(v) => setConnectionPrice(v)}
            placeholder="Плата, подк."
            frameStyle
            frameOpenHeight={DROPDOWN_OPEN_HEIGHT}
            showAddNew
            onAddNew={() => {
              const v = typeof window !== "undefined" ? window.prompt("Введите плату за подключение (р.)") : null;
              if (v != null && v.trim() !== "") {
                const n = parseInt(v.trim(), 10);
                if (!Number.isNaN(n)) setConnectionPrice(n);
              }
            }}
          />
        </div>
        <div style={{ ...FIELD_155, flexShrink: 0 }}>
          <Select
            value={monthlyPrice}
            options={MONTHLY_PRICE_OPTIONS}
            onChange={(v) => setMonthlyPrice(v)}
            placeholder="Плата, мес."
            frameStyle
            frameOpenHeight={DROPDOWN_OPEN_HEIGHT}
            showAddNew
            onAddNew={() => {
              const v = typeof window !== "undefined" ? window.prompt("Введите плату в месяц (р.)") : null;
              if (v != null && v.trim() !== "") {
                const n = parseInt(v.trim(), 10);
                if (!Number.isNaN(n)) setMonthlyPrice(n);
              }
            }}
          />
        </div>
        <div style={{ ...FIELD_155, flexShrink: 0 }}>
          <Select
            value={oneTimePrice}
            options={ONE_TIME_PRICE_OPTIONS}
            onChange={(v) => setOneTimePrice(v)}
            placeholder="Выплата"
            frameStyle
            frameOpenHeight={DROPDOWN_OPEN_HEIGHT}
            showAddNew
            onAddNew={() => {
              const v = typeof window !== "undefined" ? window.prompt("Введите сумму (р.)") : null;
              if (v != null && v.trim() !== "") {
                const n = parseInt(v.trim(), 10);
                if (!Number.isNaN(n)) setOneTimePrice(n);
              }
            }}
          />
        </div>
      </div>

      {error && <p style={{ fontSize: 14, color: "var(--error)", marginBottom: 12 }}>{error}</p>}

      {/* Кнопки: Назад 50×50 | Далее 150×50 */}
      <div style={{ display: "flex", gap, alignItems: "center" }}>
        <Link
          href="/tariffs/new"
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
          type="button"
          disabled={saving}
          onClick={handleNext}
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
            opacity: saving ? 0.7 : 1,
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
              <path d="M8 2v12M2 8h12" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <span>{saving ? "Сохранение…" : "Далее"}</span>
        </button>
      </div>
    </div>
  );
}
