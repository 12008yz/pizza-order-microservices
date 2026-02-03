'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tariffsService } from '../../services/tariffs.service';
import type { Tariff } from '../../services/api/types';
import SimTariffCard, { type SimTariffCardData } from './SimTariffCard';

function mapTariffToCard(t: Tariff): SimTariffCardData {
  const price = typeof t.price === 'number' ? t.price : parseFloat(String(t.price));
  const connectionPrice =
    t.connectionPrice != null
      ? typeof t.connectionPrice === 'number'
        ? t.connectionPrice
        : parseFloat(String(t.connectionPrice))
      : 0;
  return {
    id: t.id,
    providerName: t.provider?.name ?? 'Оператор',
    tariffName: t.name,
    price,
    connectionPrice,
    speed: t.speed,
    mobileMinutes: t.mobileMinutes,
    mobileGB: t.mobileGB,
    promoText: t.promoText ?? null,
    connectionPriceLabel:
      connectionPrice === 0 ? 'Бесплатное подключение от оператора' : `Подключение от оператора за ${connectionPrice} р.`,
  };
}

export default function SimTariffsPage() {
  const router = useRouter();
  const [tariffs, setTariffs] = useState<SimTariffCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await tariffsService.getTariffs();
        if (cancelled) return;
        if (response.success && response.data) {
          const list = Array.isArray(response.data) ? response.data : [];
          const withMobile = list.filter((t: Tariff) => t.hasMobile);
          setTariffs(withMobile.map(mapTariffToCard));
          if (withMobile.length === 0 && list.length > 0) {
            setTariffs(list.map(mapTariffToCard));
          }
        } else {
          setError(response.error ?? 'Не удалось загрузить тарифы');
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Ошибка загрузки');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleConnect = (tariffId: number) => {
    router.push(`/order?tariffId=${tariffId}`);
  };

  const handleBack = () => {
    router.push('/equipment');
  };

  return (
    <div
      className="relative w-full max-w-[400px] mx-auto flex flex-col bg-[#F5F5F5]"
      style={{
        minHeight: '100dvh',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'var(--sab, 0px)',
        boxSizing: 'border-box',
      }}
    >
      {/* Шапка: назад + заголовок */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#F5F5F5',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(16,16,16,0.08)',
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          className="outline-none cursor-pointer border border-[rgba(16,16,16,0.25)] rounded-[10px] w-12 h-12 flex items-center justify-center bg-white"
        >
          <svg width="6" height="12" viewBox="0 0 6 12" fill="none">
            <path d="M5 1L1 6L5 11" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontWeight: 400,
            fontSize: '20px',
            lineHeight: '125%',
            color: '#101010',
            margin: 0,
          }}
        >
          Тарифы для SIM-карты
        </h1>
      </div>

      {/* Контент */}
      <div style={{ padding: '20px 0 24px', overflow: 'auto' }}>
        {loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
            }}
          >
            <div
              className="animate-spin rounded-full border-2 border-[#E30611] border-t-transparent"
              style={{ width: '32px', height: '32px' }}
            />
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              padding: '24px 20px',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '14px',
              color: 'rgba(16,16,16,0.6)',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && tariffs.length === 0 && (
          <div
            style={{
              padding: '24px 20px',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '14px',
              color: 'rgba(16,16,16,0.6)',
              textAlign: 'center',
            }}
          >
            Нет доступных тарифов с мобильной связью
          </div>
        )}

        {!loading && tariffs.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              padding: '0 20px',
            }}
          >
            {tariffs.map((tariff) => (
              <SimTariffCard
                key={tariff.id}
                tariff={tariff}
                onConnect={handleConnect}
                onFavoriteClick={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
