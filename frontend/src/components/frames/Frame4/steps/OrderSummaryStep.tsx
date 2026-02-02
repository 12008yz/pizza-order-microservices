'use client';

import React, { useState, useEffect } from 'react';
import type { EquipmentState } from '../types';

const SELECTED_TARIFF_KEY = 'selectedTariff';

export interface StoredTariff {
  id: number;
  providerName: string;
  providerId: string;
  tariffName: string;
  price: string;
  priceValue: number;
  speed?: string;
  speedValue?: number;
  speedDesc?: string;
  channels?: string;
  channelsDesc?: string;
  mobile?: string;
  mobileDesc?: string;
  favoriteLabel?: string;
  favoriteDesc?: string;
  connectionPrice?: string;
  promoText?: string;
}

interface OrderSummaryStepProps {
  equipmentState: EquipmentState;
  onConnect: () => void;
  onBack: () => void;
}

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" stroke="#101010" strokeWidth="1.5" fill="none" />
    <path d="M6 10L9 13L14 7" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CrossCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" stroke="rgba(16, 16, 16, 0.3)" strokeWidth="1.5" fill="none" />
    <path d="M7 7L13 13M13 7L7 13" stroke="rgba(16, 16, 16, 0.5)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MinusCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" stroke="#101010" strokeWidth="1.5" fill="none" />
    <path d="M6 10H14" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function getRouterLabel(state: EquipmentState): string {
  const need = state.router?.need;
  if (need === 'no_thanks') return 'Не предусмотрено';
  const purchase = state.router?.purchase;
  if (purchase === 'installment') return 'Рассрочка на 24 мес. · Роутер';
  if (purchase === 'rent') return 'Аренда на время · Роутер';
  if (purchase === 'buy') return 'Покупка · Роутер';
  return 'Роутер';
}

function getTvBoxLabel(state: EquipmentState): string {
  const need = state.tvBox?.need;
  if (need === 'need') {
    const n = state.tvBox?.tvCount ?? 1;
    return n === 1 ? 'TV-приставка · 1 шт.' : `TV-приставка · ${n} шт.`;
  }
  return 'Не предусмотрено';
}

function getSimLabel(state: EquipmentState): string {
  const type = state.simCard?.connectionType;
  if (type === 'no_thanks') return 'Не предусмотрено';
  const n = state.simCard?.smartphoneCount ?? 1;
  const ex = n === 1 ? 'один экз.' : `${n} экз.`;
  return `SIM-карта · ${ex}`;
}

export default function OrderSummaryStep({ equipmentState, onConnect, onBack }: OrderSummaryStepProps) {
  const [selectedTariff, setSelectedTariff] = useState<StoredTariff | null>(null);
  const [isBackPressed, setIsBackPressed] = useState(false);
  const [isConnectPressed, setIsConnectPressed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(SELECTED_TARIFF_KEY);
      if (raw) {
        const t = JSON.parse(raw) as StoredTariff;
        setSelectedTariff(t);
      }
    } catch {
      setSelectedTariff(null);
    }
  }, []);

  const routerLabel = getRouterLabel(equipmentState);
  const tvLabel = getTvBoxLabel(equipmentState);
  const simLabel = getSimLabel(equipmentState);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',
          padding: '20px 20px 90px 20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Тариф: оператор и название */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '14px',
              lineHeight: '125%',
              color: 'rgba(16, 16, 16, 0.5)',
              marginBottom: '4px',
            }}
          >
            {selectedTariff?.providerName ?? 'Тариф'}
          </div>
          <div
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '18px',
              lineHeight: '165%',
              color: '#101010',
              fontWeight: 400,
            }}
          >
            {selectedTariff?.tariffName ?? 'Не выбран'}
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)', marginBottom: '16px' }} />

        {/* Услуги тарифа */}
        {selectedTariff?.speed && (
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
              <CheckCircleIcon />
            </div>
            <div>
              <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '16px', lineHeight: '155%', color: '#101010' }}>
                {selectedTariff.speed}
              </div>
              <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.5)' }}>
                {selectedTariff.speedDesc ?? 'Безлимитное соединение в квартире'}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            <CrossCircleIcon />
          </div>
          <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '16px', lineHeight: '155%', color: 'rgba(16, 16, 16, 0.5)' }}>
            Не предусмотрено Телевидение
          </div>
        </div>

        {selectedTariff?.mobile && (
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
              <CheckCircleIcon />
            </div>
            <div>
              <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '16px', lineHeight: '155%', color: '#101010' }}>
                {selectedTariff.mobile}
              </div>
              <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.5)' }}>
                {selectedTariff.mobileDesc ?? 'Мобильное соединение'}
              </div>
            </div>
          </div>
        )}

        {selectedTariff?.favoriteLabel && (
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
              <CheckCircleIcon />
            </div>
            <div>
              <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '16px', lineHeight: '155%', color: '#101010' }}>
                {selectedTariff.favoriteLabel}
              </div>
              <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.5)' }}>
                {selectedTariff.favoriteDesc ?? 'Дополнительное приложение'}
              </div>
            </div>
          </div>
        )}

        {/* Оборудование */}
        <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)', margin: '16px 0' }} />
        <div
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '14px',
            lineHeight: '125%',
            color: 'rgba(16, 16, 16, 0.6)',
            marginBottom: '12px',
          }}
        >
          Оборудование
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            <MinusCircleIcon />
          </div>
          <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '16px', lineHeight: '155%', color: '#101010' }}>
            {routerLabel}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            {equipmentState.tvBox?.need === 'need' ? <MinusCircleIcon /> : <CrossCircleIcon />}
          </div>
          <div>
            <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '16px', lineHeight: '155%', color: equipmentState.tvBox?.need === 'need' ? '#101010' : 'rgba(16, 16, 16, 0.5)' }}>
              {tvLabel}
            </div>
            {equipmentState.tvBox?.need !== 'need' && (
              <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.5)' }}>
                TV-приставка
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            <MinusCircleIcon />
          </div>
          <div>
            <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '16px', lineHeight: '155%', color: '#101010' }}>
              Подключение текущего номера
            </div>
            <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.5)' }}>
              {simLabel}
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)', margin: '16px 0' }} />

        {/* Цена */}
        <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '22px', lineHeight: '115%', color: '#101010', marginBottom: '4px' }}>
          {selectedTariff?.price ?? '— р./мес.'}
        </div>
        {selectedTariff?.promoText && (
          <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.6)', marginBottom: '4px' }}>
            {selectedTariff.promoText}
          </div>
        )}
        <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.5)' }}>
          {selectedTariff?.connectionPrice ?? 'Бесплатное подключение от оператора'}
        </div>
      </div>

      {/* Кнопки */}
      <button
        type="button"
        onClick={onBack}
        onMouseDown={() => setIsBackPressed(true)}
        onMouseUp={() => setIsBackPressed(false)}
        onMouseLeave={() => setIsBackPressed(false)}
        className="outline-none cursor-pointer border border-[rgba(16,16,16,0.25)] rounded-[10px] flex items-center justify-center bg-transparent"
        style={{
          position: 'absolute',
          left: '15px',
          bottom: '15px',
          width: '50px',
          height: '50px',
          transform: isBackPressed ? 'scale(0.92)' : 'scale(1)',
          transition: 'transform 0.15s ease-out',
        }}
      >
        <svg width="6" height="12" viewBox="0 0 6 12" fill="none">
          <path d="M5 1L1 6L5 11" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onConnect}
        onMouseDown={() => setIsConnectPressed(true)}
        onMouseUp={() => setIsConnectPressed(false)}
        onMouseLeave={() => setIsConnectPressed(false)}
        className="outline-none cursor-pointer rounded-[10px] flex items-center justify-center text-white font-normal text-base bg-[#101010] border border-[rgba(16,16,16,0.25)]"
        style={{
          position: 'absolute',
          left: '70px',
          right: '15px',
          bottom: '15px',
          height: '50px',
          fontFamily: 'TT Firs Neue, sans-serif',
          lineHeight: '125%',
          transform: isConnectPressed ? 'scale(0.97)' : 'scale(1)',
          transition: 'transform 0.15s ease-out',
        }}
      >
        Подключить
      </button>
    </>
  );
}
