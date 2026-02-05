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
const TV_BOX_EXTRA_PER_UNIT = 50; // за каждую приставку после первой
const SIM_EXTRA_PER_UNIT = 30; // за каждую SIM после первой

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

const PlusCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" stroke="#101010" strokeWidth="1.5" fill="none" />
    <path d="M10 6V14M6 10H14" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" />
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

function getRouterAddOnPrice(state: EquipmentState): number {
  if (state.router?.need === 'no_thanks') return 0;
  if (state.router?.purchase === 'rent') return ROUTER_RENT_MONTHLY;
  if (state.router?.purchase === 'installment') return ROUTER_INSTALLMENT_MONTHLY;
  return 0;
}

function getTvBoxLabel(state: EquipmentState): string {
  const need = state.tvBox?.need;
  if (need === 'need') {
    const n = state.tvBox?.tvCount ?? 1;
    return n === 1 ? 'TV-приставка · 1 шт.' : `TV-приставка · ${n} шт.`;
  }
  return 'Не предусмотрено';
}

function getTvBoxAddOnPrice(state: EquipmentState): number {
  if (state.tvBox?.need !== 'need') return 0;
  const n = state.tvBox?.tvCount ?? 1;
  return (n - 1) * TV_BOX_EXTRA_PER_UNIT;
}

function getSimLabel(state: EquipmentState): string {
  const type = state.simCard?.connectionType;
  if (type === 'no_thanks') return 'Не предусмотрено';
  const n = state.simCard?.smartphoneCount ?? 1;
  const ex = n === 1 ? 'один экз.' : `${n} экз.`;
  return `SIM-карта · ${ex}`;
}

function getSimAddOnPrice(state: EquipmentState): number {
  if (state.simCard?.connectionType === 'no_thanks') return 0;
  const n = state.simCard?.smartphoneCount ?? 1;
  return (n - 1) * SIM_EXTRA_PER_UNIT;
}

const ROUTER_PURCHASE_ORDER: RouterPurchaseOption[] = ['buy', 'installment', 'rent'];

function nextRouterPurchase(current: RouterPurchaseOption | null | undefined): RouterPurchaseOption {
  const idx = ROUTER_PURCHASE_ORDER.indexOf(current ?? 'buy');
  return ROUTER_PURCHASE_ORDER[(idx + 1) % ROUTER_PURCHASE_ORDER.length];
}

export default function OrderSummaryStep({
  equipmentState,
  onConnect,
  onBack,
  callbacks,
}: OrderSummaryStepProps) {
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

  const { totalMonthly, addOnsBreakdown } = useMemo(() => {
    const base = selectedTariff?.priceValue ?? 0;
    const routerAdd = getRouterAddOnPrice(equipmentState);
    const tvAdd = getTvBoxAddOnPrice(equipmentState);
    const simAdd = getSimAddOnPrice(equipmentState);
    const total = base + routerAdd + tvAdd + simAdd;
    return {
      totalMonthly: total,
      addOnsBreakdown: { router: routerAdd, tv: tvAdd, sim: simAdd },
    };
  }, [selectedTariff?.priceValue, equipmentState]);

  const handleRouterMinus = () => callbacks.onRouterNeedChange('no_thanks');
  const handleRouterPlus = () => {
    callbacks.onRouterNeedChange('need');
    callbacks.onRouterPurchaseChange('buy');
  };
  const handleRouterCyclePurchase = () => {
    if (equipmentState.router?.need === 'no_thanks') return;
    callbacks.onRouterPurchaseChange(nextRouterPurchase(equipmentState.router?.purchase));
  };

  const handleTvMinus = () => {
    if (equipmentState.tvBox?.need !== 'need') return;
    const n = equipmentState.tvBox?.tvCount ?? 1;
    if (n <= 1) callbacks.onTvBoxNeedChange('have_own');
    else callbacks.onTvBoxCountChange((n - 1) as TvCountOption);
  };
  const handleTvPlus = () => {
    if (equipmentState.tvBox?.need !== 'need') {
      callbacks.onTvBoxNeedChange('need');
      callbacks.onTvBoxCountChange(1);
    } else {
      const n = Math.min(4, (equipmentState.tvBox?.tvCount ?? 1) + 1);
      callbacks.onTvBoxCountChange(n as TvCountOption);
    }
  };

  const handleSimMinus = () => {
    if (equipmentState.simCard?.connectionType === 'no_thanks') return;
    const n = Math.max(1, (equipmentState.simCard?.smartphoneCount ?? 1) - 1);
    callbacks.onSimCountChange(n as SimSmartphoneCount);
  };
  const handleSimPlus = () => {
    if (equipmentState.simCard?.connectionType === 'no_thanks') return;
    const n = Math.min(4, (equipmentState.simCard?.smartphoneCount ?? 1) + 1);
    callbacks.onSimCountChange(n as SimSmartphoneCount);
  };

  const routerAddOn = addOnsBreakdown.router;
  const tvAddOn = addOnsBreakdown.tv;
  const simAddOn = addOnsBreakdown.sim;
  const hasAnyAddOn = routerAddOn > 0 || tvAddOn > 0 || simAddOn > 0;

  return (
    <div className="flex flex-col w-full">
      <div
        className="flex-1 overflow-y-auto px-[15px] pt-[15px] pb-2"
        style={{ WebkitOverflowScrolling: 'touch', boxSizing: 'border-box' }}
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

        {/* Оборудование — интерактивные строки с +/- */}
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

        {/* Роутер */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <button
              type="button"
              onClick={handleRouterMinus}
              className="outline-none cursor-pointer border-0 bg-transparent p-0 flex-shrink-0"
              style={{ marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Убрать роутер"
            >
              <MinusCircleIcon />
            </button>
            <button
              type="button"
              onClick={equipmentState.router?.need === 'no_thanks' ? handleRouterPlus : handleRouterCyclePurchase}
              className="outline-none cursor-pointer border-0 bg-transparent p-0 flex-shrink-0"
              style={{ marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label={equipmentState.router?.need === 'no_thanks' ? 'Добавить роутер' : 'Изменить вариант роутера'}
            >
              <PlusCircleIcon />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '16px', lineHeight: '155%', color: '#101010' }}>
                {routerLabel}
              </div>
              {routerAddOn > 0 && (
                <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.6)' }}>
                  +{routerAddOn} р./мес.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TV-приставка */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <button
              type="button"
              onClick={handleTvMinus}
              className="outline-none cursor-pointer border-0 bg-transparent p-0 flex-shrink-0"
              style={{ marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Уменьшить"
            >
              {equipmentState.tvBox?.need === 'need' ? <MinusCircleIcon /> : <CrossCircleIcon />}
            </button>
            <button
              type="button"
              onClick={handleTvPlus}
              className="outline-none cursor-pointer border-0 bg-transparent p-0 flex-shrink-0"
              style={{ marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Увеличить"
            >
              <PlusCircleIcon />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '16px', lineHeight: '155%', color: equipmentState.tvBox?.need === 'need' ? '#101010' : 'rgba(16, 16, 16, 0.5)' }}>
                {tvLabel}
              </div>
              {equipmentState.tvBox?.need !== 'need' && (
                <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.5)' }}>
                  TV-приставка
                </div>
              )}
              {tvAddOn > 0 && (
                <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.6)' }}>
                  +{tvAddOn} р./мес.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Подключение текущего номера / SIM */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <button
              type="button"
              onClick={handleSimMinus}
              disabled={equipmentState.simCard?.connectionType === 'no_thanks' || (equipmentState.simCard?.smartphoneCount ?? 1) <= 1}
              className="outline-none cursor-pointer border-0 bg-transparent p-0 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Уменьшить"
            >
              <MinusCircleIcon />
            </button>
            <button
              type="button"
              onClick={handleSimPlus}
              disabled={equipmentState.simCard?.connectionType === 'no_thanks' || (equipmentState.simCard?.smartphoneCount ?? 1) >= 4}
              className="outline-none cursor-pointer border-0 bg-transparent p-0 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Увеличить"
            >
              <PlusCircleIcon />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '16px', lineHeight: '155%', color: '#101010' }}>
                Подключение текущего номера
              </div>
              <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.5)' }}>
                {simLabel}
              </div>
              {simAddOn > 0 && (
                <div style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.6)' }}>
                  +{simAddOn} р./мес.
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)', margin: '16px 0' }} />

        {/* Итоговая цена — пересчитывается автоматически */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '4px',
          }}
        >
          <span style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '22px', lineHeight: '115%', color: '#101010' }}>
            {totalMonthly} р./мес.
          </span>
          {hasAnyAddOn && (
            <span style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '125%', color: 'rgba(16, 16, 16, 0.6)' }}>
              (тариф {selectedTariff?.priceValue ?? 0}
              {routerAddOn > 0 && ` + роутер ${routerAddOn}`}
              {tvAddOn > 0 && ` + ТВ ${tvAddOn}`}
              {simAddOn > 0 && ` + SIM ${simAddOn}`})
            </span>
          )}
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

      {/* Кнопки навигации */}
      <div className="flex-shrink-0 flex gap-[10px] px-[15px] pb-[15px] pt-[10px]">
        <button
          type="button"
          onClick={onBack}
          onMouseDown={() => setIsBackPressed(true)}
          onMouseUp={() => setIsBackPressed(false)}
          onMouseLeave={() => setIsBackPressed(false)}
          onTouchStart={() => setIsBackPressed(true)}
          onTouchEnd={() => setIsBackPressed(false)}
          className="outline-none cursor-pointer rounded-[10px] flex items-center justify-center flex-shrink-0 bg-transparent"
          style={{
            width: '50px',
            height: '50px',
            border: '1px solid rgba(16, 16, 16, 0.25)',
            boxSizing: 'border-box',
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
          onTouchStart={() => setIsConnectPressed(true)}
          onTouchEnd={() => setIsConnectPressed(false)}
          className="outline-none cursor-pointer flex-1 rounded-[10px] flex items-center justify-center text-center text-white min-h-[50px]"
          style={{
            background: '#101010',
            border: '1px solid rgba(16, 16, 16, 0.25)',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
            lineHeight: '125%',
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
