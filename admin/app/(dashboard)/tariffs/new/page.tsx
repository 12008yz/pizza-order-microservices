"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { fetchProviders } from "@/lib/api";
import { providerApi } from "@/lib/api";

interface Provider {
  id: number;
  name: string;
}

export default function NewTariffPage() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("residential");
  const [providerId, setProviderId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [hasWi, setHasWi] = useState(true);
  const [hasTv, setHasTv] = useState(true);
  const [hasSim, setHasSim] = useState(false);
  const [technology, setTechnology] = useState("FTTX·8");
  const [connectionPrice, setConnectionPrice] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [payout, setPayout] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProviders().then((res: { data?: Provider[] }) => setProviders(Array.isArray(res?.data) ? res.data : []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!providerId || !name.trim() || !monthlyPrice.trim()) {
      setError("Заполните оператора, название тарифа и плату за месяц");
      return;
    }
    setSaving(true);
    try {
      await providerApi.post("/api/tariffs", {
        name: name.trim(),
        providerId: Number(providerId),
        description: "",
        speed: hasWi ? 100 : 0,
        price: parseFloat(monthlyPrice) || 0,
        connectionPrice: parseFloat(connectionPrice) || 0,
        technology: technology.startsWith("FTTX") || technology === "GPON" ? "fiber" : technology === "DOCSIS" ? "cable" : "fiber",
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
        <p className="text-success">Тариф создан.</p>
        <Link href="/tariffs" className="text-sm underline">К базе планов</Link>
      </div>
    );
  }

  const labelClass = "block font-frame text-xs leading-[125%] text-[rgba(16,16,16,0.5)] mb-1";
  const selectClass = "h-[50px] min-h-[50px] rounded-[10px] border border-[rgba(16,16,16,0.25)] pl-[15px] pr-[16px] text-[16px] bg-white font-frame";

  return (
    <div className="max-w-2xl font-frame">
      <h1 className="text-[20px] leading-[125%] text-[#101010] font-normal mb-4">Предложение</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className={labelClass}>Категория</label>
                <select
                  className={selectClass + " min-w-[140px]"}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="residential">Жилое, кв.</option>
                  <option value="commercial">Нежилое</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Название оператора</label>
                <select
                  className={selectClass + " min-w-[180px]"}
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
                <label className={labelClass}>Название тариф. пл.</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Название тарифа"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={hasWi} onChange={(e) => setHasWi(e.target.checked)} />
                <span className="text-sm">WI</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={hasTv} onChange={(e) => setHasTv(e.target.checked)} />
                <span className="text-sm">TV</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={hasSim} onChange={(e) => setHasSim(e.target.checked)} />
                <span className="text-sm">SIM</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {["FTTX·4", "FTTX·8", "GPON", "DOCSIS"].map((t) => (
                <label key={t} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tech"
                    checked={technology === t}
                    onChange={() => setTechnology(t)}
                  />
                  <span className="text-sm">{t}</span>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className={labelClass}>Плата подк.</label>
                <Input
                  type="number"
                  min={0}
                  value={connectionPrice}
                  onChange={(e) => setConnectionPrice(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Плата мес.</label>
                <Input
                  type="number"
                  min={0}
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Выплата</label>
                <Input
                  type="number"
                  min={0}
                  value={payout}
                  onChange={(e) => setPayout(e.target.value)}
                />
              </div>
            </div>
          </>
        )}
        {error && <p className="text-sm text-error">{error}</p>}
        <div className="flex gap-2">
          {step > 1 && (
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
              ◀ Назад
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? "Сохранение..." : "Создать тариф"}
          </Button>
        </div>
      </form>
    </div>
  );
}
