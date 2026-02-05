'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type {
  EquipmentState,
  RouterNeedOption,
  RouterPurchaseOption,
  TvBoxNeedOption,
  TvCountOption,
  SimSmartphoneCount,
} from '../types';

const SELECTED_TARIFF_KEY = 'selectedTariff';

// Надбавки к тарифу за оборудование (р./мес.)
const ROUTER_RENT_MONTHLY = 80;
const ROUTER_INSTALLMENT_MONTHLY = 200;
const TV_BOX_EXTRA_PER_UNIT = 50;
const SIM_EXTRA_PER_UNIT = 30;

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

export interface OrderSummaryCallbacks {
  onRouterNeedChange: (need: RouterNeedOption) => void;
  onRouterPurchaseChange: (purchase: RouterPurchaseOption) => void;
  onTvBoxNeedChange: (need: TvBoxNeedOption) => void;
  onTvBoxCountChange: (count: TvCountOption) => void;
  onSimCountChange: (count: SimSmartphoneCount) => void;
}

interface OrderSummaryStepProps {
  equipmentState: EquipmentState;
  onConnect: () => void;
  onBack: () => void;
  callbacks: OrderSummaryCallbacks;
}

// Иконка галочки в круге
const CheckCircleIcon = ({ active = true }: { active?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke={active ? '#101010' : 'rgba(16, 16, 16, 0.25)'} strokeWidth="1.5" fill="none" />
    <path d="M5 8L7 10L11 6" stroke={active ? '#101010' : 'rgba(16, 16, 16, 0.25)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Иконка крестика в круге (для "Не предусмотрено")
const CrossCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="rgba(16, 16, 16, 0.25)" strokeWidth="1.5" fill="none" />
    <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="rgba(16, 16, 16, 0.25)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Иконка плюса в круге (красная для "Дополнить")
const PlusCircleRedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="#FF1000" />
    <path d="M8 4.5V11.5M4.5 8H11.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Иконка минуса в круге
const MinusCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="#101010" strokeWidth="1.5" fill="none" />
    <path d="M5 8H11" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Иконка информации
const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="rgba(16, 16, 16, 0.25)" strokeWidth="1.5" fill="none" />
    <path d="M8 7V11" stroke="rgba(16, 16, 16, 0.25)" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="5" r="0.75" fill="rgba(16, 16, 16, 0.25)" />
  </svg>
);

// Иконка сердца (outline)
const HeartOutlineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 21C12 21 3 14.5 3 8.5C3 5.5 5.5 3 8.5 3C10.04 3 11.54 3.99 12 4.5C12.46 3.99 13.96 3 15.5 3C18.5 3 21 5.5 21 8.5C21 14.5 12 21 12 21Z"
      stroke="#101010"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Красная точка уведомления
const NotificationDot = () => (
  <div
    style={{
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      width: '16px',
      height: '16px',
      background: '#FF1000',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <svg width="6" height="8" viewBox="0 0 6 8" fill="none">
      <path d="M1 1L5 4L1 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

function getRouterLabel(state: EquipmentState): { main: string; sub: string; isActive: boolean; needsAdd: boolean } {
  const need = state.router?.need;
  if (need === 'no_thanks' || !need) {
    return { main: 'Дополнить', sub: 'Роутер', isActive: false, needsAdd: true };
  }
  const purchase = state.router?.purchase;
  if (purchase === 'installment') return { main: 'Рассрочка на 24 мес.', sub: 'Роутер', isActive: true, needsAdd: false };
  if (purchase === 'rent') return { main: 'Аренда на время', sub: 'Роутер', isActive: true, needsAdd: false };
  if (purchase === 'buy') return { main: 'Покупка', sub: 'Роутер', isActive: true, needsAdd: false };
  return { main: 'Дополнить', sub: 'Роутер', isActive: false, needsAdd: true };
}

function getRouterAddOnPrice(state: EquipmentState): number {
  if (state.router?.need === 'no_thanks') return 0;
  if (state.router?.purchase === 'rent') return ROUTER_RENT_MONTHLY;
  if (state.router?.purchase === 'installment') return ROUTER_INSTALLMENT_MONTHLY;
  return 0;
}

function getTvBoxLabel(state: EquipmentState): { main: string; sub: string; isActive: boolean } {
  const need = state.tvBox?.need;
  if (need === 'need') {
    const n = state.tvBox?.tvCount ?? 1;
    return { main: `TV-приставка · ${n} шт.`, sub: 'TV-приставка', isActive: true };
  }
  return { main: 'Не предусмотрено', sub: 'TV-приставка', isActive: false };
}

function getTvBoxAddOnPrice(state: EquipmentState): number {
  if (state.tvBox?.need !== 'need') return 0;
  const n = state.tvBox?.tvCount ?? 1;
  return (n - 1) * TV_BOX_EXTRA_PER_UNIT;
}

function getSimLabel(state: EquipmentState): { main: string; sub: string; extra: string; isActive: boolean } {
  const type = state.simCard?.connectionType;
  if (type === 'no_thanks' || !type) {
    return { main: 'Не предусмотрено', sub: 'SIM-карта', extra: '', isActive: false };
  }
  const n = state.simCard?.smartphoneCount ?? 1;
  const ex = n === 1 ? 'один экз.' : `${n} экз.`;
  return { main: 'Подключение текущего номера', sub: 'SIM-карта', extra: ex, isActive: true };
}

function getSimAddOnPrice(state: EquipmentState): number {
  if (state.simCard?.connectionType === 'no_thanks') return 0;
  const n = state.simCard?.smartphoneCount ?? 1;
  return (n - 1) * SIM_EXTRA_PER_UNIT;
}

export default function OrderSummaryStep({
  equipmentState,
  onConnect,
  onBack,
  callbacks,
}: OrderSummaryStepProps) {
  const [selectedTariff, setSelectedTariff] = useState<StoredTariff | null>(null);
  const [isHeartPressed, setIsHeartPressed] = useState(false);
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

  const routerInfo = getRouterLabel(equipmentState);
  const tvInfo = getTvBoxLabel(equipmentState);
  const simInfo = getSimLabel(equipmentState);

  const { totalMonthly } = useMemo(() => {
    const base = selectedTariff?.priceValue ?? 0;
    const routerAdd = getRouterAddOnPrice(equipmentState);
    const tvAdd = getTvBoxAddOnPrice(equipmentState);
    const simAdd = getSimAddOnPrice(equipmentState);
    const total = base + routerAdd + tvAdd + simAdd;
    return { totalMonthly: total };
  }, [selectedTariff?.priceValue, equipmentState]);

  // Handlers for router
  const handleRouterClick = () => {
    if (routerInfo.needsAdd) {
      callbacks.onRouterNeedChange('need');
      callbacks.onRouterPurchaseChange('buy');
    }
  };

  return (
    <div
      className="flex flex-col w-full"
      style={{
        fontFamily: 'TT Firs Neue, sans-serif',
      }}
    >
      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: '15px',
          paddingBottom: '10px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Тариф: провайдер и название */}
        <div style={{ marginBottom: '10px', position: 'relative' }}>
          <div
            style={{
              fontSize: '16px',
              lineHeight: '125%',
              color: 'rgba(16, 16, 16, 0.5)',
              marginBottom: '0px',
            }}
          >
            {selectedTariff?.providerName ?? 'МТС'}
          </div>
          <div
            style={{
              fontSize: '18px',
              lineHeight: '165%',
              color: '#101010',
              fontWeight: 400,
            }}
          >
            {selectedTariff?.tariffName ?? 'РИИЛ. NEW'}
          </div>
          {/* Info icon */}
          <div
            style={{
              position: 'absolute',
              right: '0',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <InfoIcon />
          </div>
        </div>

        {/* Разделитель */}
        <div
          style={{
            height: '1px',
            background: 'rgba(16, 16, 16, 0.1)',
            marginBottom: '10px',
          }}
        />

        {/* Скорость интернета */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            <CheckCircleIcon active={true} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '16px',
                lineHeight: '155%',
                color: '#101010',
              }}
            >
              {selectedTariff?.speed ?? '500 Мбит/сек'}
            </div>
            <div
              style={{
                fontSize: '14px',
                lineHeight: '105%',
                color: 'rgba(16, 16, 16, 0.5)',
              }}
            >
              {selectedTariff?.speedDesc ?? 'Безлимитное соединение в квартире'}
            </div>
          </div>
        </div>

        {/* Телевидение - Не предусмотрено */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            <CrossCircleIcon />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '16px',
                lineHeight: '155%',
                color: 'rgba(16, 16, 16, 0.25)',
              }}
            >
              Не предусмотрено
            </div>
            <div
              style={{
                fontSize: '14px',
                lineHeight: '105%',
                color: 'rgba(16, 16, 16, 0.5)',
              }}
            >
              Телевидение
            </div>
          </div>
        </div>

        {/* Мобильное соединение */}
        {selectedTariff?.mobile && (
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
              <CheckCircleIcon active={true} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '16px',
                  lineHeight: '155%',
                  color: '#101010',
                }}
              >
                {selectedTariff.mobile}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  lineHeight: '105%',
                  color: 'rgba(16, 16, 16, 0.5)',
                }}
              >
                {selectedTariff.mobileDesc ?? 'Мобильное соединение'}
              </div>
            </div>
          </div>
        )}

        {/* Кинотеатр KION */}
        {selectedTariff?.favoriteLabel && (
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
              <CheckCircleIcon active={true} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '16px',
                  lineHeight: '155%',
                  color: '#101010',
                }}
              >
                {selectedTariff.favoriteLabel}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  lineHeight: '105%',
                  color: 'rgba(16, 16, 16, 0.5)',
                }}
              >
                {selectedTariff.favoriteDesc ?? 'Дополнительное приложение'}
              </div>
            </div>
          </div>
        )}

        {/* Разделитель перед оборудованием */}
        <div
          style={{
            height: '1px',
            background: 'rgba(16, 16, 16, 0.1)',
            marginTop: '5px',
            marginBottom: '10px',
          }}
        />

        {/* Роутер */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: '10px',
            cursor: routerInfo.needsAdd ? 'pointer' : 'default',
          }}
          onClick={handleRouterClick}
        >
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            {routerInfo.needsAdd ? <PlusCircleRedIcon /> : <CheckCircleIcon active={true} />}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '16px',
                lineHeight: '155%',
                color: routerInfo.needsAdd ? 'rgba(255, 16, 0, 0.75)' : '#101010',
              }}
            >
              {routerInfo.main}
            </div>
            <div
              style={{
                fontSize: '14px',
                lineHeight: '105%',
                color: routerInfo.needsAdd ? 'rgba(255, 16, 0, 0.5)' : 'rgba(16, 16, 16, 0.5)',
              }}
            >
              {routerInfo.sub}
            </div>
          </div>
        </div>

        {/* TV-приставка */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            {tvInfo.isActive ? <CheckCircleIcon active={true} /> : <CrossCircleIcon />}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '16px',
                lineHeight: '155%',
                color: tvInfo.isActive ? '#101010' : 'rgba(16, 16, 16, 0.25)',
              }}
            >
              {tvInfo.main}
            </div>
            <div
              style={{
                fontSize: '14px',
                lineHeight: '105%',
                color: 'rgba(16, 16, 16, 0.5)',
              }}
            >
              {tvInfo.sub}
            </div>
          </div>
        </div>

        {/* SIM-карта */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px', position: 'relative' }}>
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            {simInfo.isActive ? <MinusCircleIcon /> : <CrossCircleIcon />}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '16px',
                lineHeight: '155%',
                color: simInfo.isActive ? '#101010' : 'rgba(16, 16, 16, 0.25)',
              }}
            >
              {simInfo.main}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  lineHeight: '105%',
                  color: 'rgba(16, 16, 16, 0.5)',
                }}
              >
                {simInfo.sub}
              </span>
              {simInfo.extra && (
                <span
                  style={{
                    fontSize: '14px',
                    lineHeight: '105%',
                    color: 'rgba(16, 16, 16, 0.5)',
                    textAlign: 'right',
                  }}
                >
                  {simInfo.extra}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Разделитель перед ценой */}
        <div
          style={{
            height: '1px',
            background: 'rgba(16, 16, 16, 0.1)',
            marginTop: '5px',
            marginBottom: '15px',
          }}
        />

        {/* Цена */}
        <div style={{ marginBottom: '5px', position: 'relative' }}>
          <div
            style={{
              fontSize: '22px',
              lineHeight: '115%',
              color: '#101010',
              marginBottom: '5px',
            }}
          >
            {totalMonthly} р./мес.
          </div>
          {/* Красная точка с уведомлением */}
          <div
            style={{
              position: 'absolute',
              right: '0',
              top: '0',
            }}
          >
            <NotificationDot />
          </div>
        </div>

        {/* Промо текст */}
        <div
          style={{
            fontSize: '14px',
            lineHeight: '145%',
            color: 'rgba(16, 16, 16, 0.5)',
            marginBottom: '2px',
          }}
        >
          {selectedTariff?.promoText ?? '2 месяца по 345 р./мес. по акции'}
        </div>
        <div
          style={{
            fontSize: '14px',
            lineHeight: '145%',
            color: 'rgba(16, 16, 16, 0.5)',
          }}
        >
          {selectedTariff?.connectionPrice ?? 'Бесплатное подключение от оператора'}
        </div>
      </div>

      {/* Кнопки навигации - фиксированные снизу */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          gap: '10px',
          padding: '15px',
          paddingTop: '10px',
        }}
      >
        {/* Кнопка сердце */}
        <button
          type="button"
          onClick={onBack}
          onMouseDown={() => setIsHeartPressed(true)}
          onMouseUp={() => setIsHeartPressed(false)}
          onMouseLeave={() => setIsHeartPressed(false)}
          onTouchStart={() => setIsHeartPressed(true)}
          onTouchEnd={() => setIsHeartPressed(false)}
          className="outline-none cursor-pointer"
          style={{
            width: '50px',
            height: '50px',
            border: '1px solid rgba(16, 16, 16, 0.1)',
            borderRadius: '10px',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxSizing: 'border-box',
            transform: isHeartPressed ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <HeartOutlineIcon />
        </button>

        {/* Кнопка Подключить */}
        <button
          type="button"
          onClick={onConnect}
          onMouseDown={() => setIsConnectPressed(true)}
          onMouseUp={() => setIsConnectPressed(false)}
          onMouseLeave={() => setIsConnectPressed(false)}
          onTouchStart={() => setIsConnectPressed(true)}
          onTouchEnd={() => setIsConnectPressed(false)}
          className="outline-none cursor-pointer"
          style={{
            flex: 1,
            height: '50px',
            background: '#101010',
            border: '1px solid rgba(16, 16, 16, 0.25)',
            borderRadius: '10px',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
            lineHeight: '315%',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxSizing: 'border-box',
            transform: isConnectPressed ? 'scale(0.97)' : 'scale(1)',
            transition: 'transform 0.15s ease-out',
          }}
        >
          Подключить
        </button>
      </div>
    </div>
  );
}
