'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AnimatedCheck from '../../../common/AnimatedCheck';
import type {
  EquipmentState,
  RouterNeedOption,
  RouterPurchaseOption,
  TvBoxNeedOption,
  TvCountOption,
  SimSmartphoneCount,
  SimConnectionType,
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
  onSimConnectionTypeChange: (type: SimConnectionType) => void;
}

interface OrderSummaryStepProps {
  equipmentState: EquipmentState;
  onConnect: () => void;
  onBack: () => void;
  callbacks: OrderSummaryCallbacks;
}

// Иконка галочки в круге (как в 1 фрейме)
const CheckCircleIcon = ({ active = true }: { active?: boolean }) => {
  const color = active ? '#101010' : 'rgba(16, 16, 16, 0.25)';
  return (
    <span className="relative inline-block" style={{ width: 16, height: 16 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute inset-0">
        <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" fill="none" />
      </svg>
      <span className="absolute" style={{ left: 4, top: 4 }}>
        <AnimatedCheck size={8} color={color} strokeWidth={1.5} />
      </span>
    </span>
  );
};

// Иконка крестика в круге (для "Не предусмотрено")
const CrossCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10.8969 5.97384L8.87 8L10.8969 10.0262C10.9541 10.0833 10.9995 10.1512 11.0304 10.2259C11.0613 10.3006 11.0773 10.3807 11.0773 10.4615C11.0773 10.5424 11.0613 10.6225 11.0304 10.6972C10.9995 10.7719 10.9541 10.8397 10.8969 10.8969C10.8397 10.9541 10.7719 10.9994 10.6972 11.0304C10.6225 11.0613 10.5424 11.0773 10.4615 11.0773C10.3807 11.0773 10.3006 11.0613 10.2259 11.0304C10.1512 10.9994 10.0833 10.9541 10.0262 10.8969L8 8.87L5.97385 10.8969C5.91667 10.9541 5.8488 10.9994 5.77409 11.0304C5.69939 11.0613 5.61932 11.0773 5.53846 11.0773C5.45761 11.0773 5.37754 11.0613 5.30284 11.0304C5.22813 10.9994 5.16025 10.9541 5.10308 10.8969C5.0459 10.8397 5.00055 10.7719 4.96961 10.6972C4.93866 10.6225 4.92274 10.5424 4.92274 10.4615C4.92274 10.3807 4.93866 10.3006 4.96961 10.2259C5.00055 10.1512 5.0459 10.0833 5.10308 10.0262L7.13 8L5.10308 5.97384C4.98761 5.85837 4.92274 5.70176 4.92274 5.53846C4.92274 5.37516 4.98761 5.21855 5.10308 5.10308C5.21855 4.9876 5.37516 4.92273 5.53846 4.92273C5.70177 4.92273 5.85838 4.9876 5.97385 5.10308L8 7.13L10.0262 5.10308C10.0833 5.0459 10.1512 5.00055 10.2259 4.9696C10.3006 4.93866 10.3807 4.92273 10.4615 4.92273C10.5424 4.92273 10.6225 4.93866 10.6972 4.9696C10.7719 5.00055 10.8397 5.0459 10.8969 5.10308C10.9541 5.16025 10.9995 5.22813 11.0304 5.30283C11.0613 5.37753 11.0773 5.4576 11.0773 5.53846C11.0773 5.61932 11.0613 5.69939 11.0304 5.77409C10.9995 5.84879 10.9541 5.91667 10.8969 5.97384ZM16 8C16 9.58225 15.5308 11.129 14.6518 12.4446C13.7727 13.7602 12.5233 14.7855 11.0615 15.391C9.59966 15.9965 7.99113 16.155 6.43928 15.8463C4.88743 15.5376 3.46197 14.7757 2.34315 13.6568C1.22433 12.538 0.462403 11.1126 0.153721 9.56072C-0.15496 8.00887 0.00346631 6.40034 0.608967 4.93853C1.21447 3.47672 2.23985 2.22729 3.55544 1.34824C4.87103 0.469192 6.41775 0 8 0C10.121 0.00223986 12.1546 0.845813 13.6544 2.34562C15.1542 3.84542 15.9978 5.87895 16 8ZM14.7692 8C14.7692 6.66117 14.3722 5.35241 13.6284 4.23922C12.8846 3.12602 11.8274 2.25839 10.5905 1.74605C9.35356 1.2337 7.99249 1.09965 6.67939 1.36084C5.36629 1.62203 4.16013 2.26674 3.21343 3.21343C2.26674 4.16012 1.62203 5.36628 1.36084 6.67939C1.09965 7.99249 1.2337 9.35356 1.74605 10.5905C2.2584 11.8274 3.12603 12.8846 4.23922 13.6284C5.35241 14.3722 6.66118 14.7692 8 14.7692C9.79469 14.7672 11.5153 14.0534 12.7843 12.7843C14.0534 11.5153 14.7672 9.79468 14.7692 8Z" fill="rgba(16, 16, 16, 0.25)" />
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

// Красный огонёк (как в Frame3) — напротив промо-текста
const PromoFireIcon = () => (
  <div
    style={{
      width: '16px',
      height: '16px',
      flexShrink: 0,
      background: '#FF1000',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <svg width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.75927 0.0684591C3.72341 0.0380912 3.68091 0.0169502 3.63534 0.00681841C3.58978 -0.00331335 3.54249 -0.00213889 3.49746 0.0102428C3.45244 0.0226244 3.411 0.0458503 3.37663 0.0779624C3.34227 0.110074 3.31598 0.150131 3.3 0.194756L2.5 2.43218L1.62145 1.56514C1.59195 1.53599 1.55672 1.51354 1.51808 1.49927C1.47943 1.485 1.43826 1.47924 1.39727 1.48235C1.35629 1.48546 1.31641 1.49739 1.28028 1.51734C1.24414 1.53729 1.21257 1.56482 1.18764 1.5981C0.4 2.64922 0 3.70663 0 4.74072C0 5.60513 0.337142 6.43414 0.937258 7.04538C1.53737 7.65661 2.35131 8 3.2 8C4.04869 8 4.86263 7.65661 5.46274 7.04538C6.06286 6.43414 6.4 5.60513 6.4 4.74072C6.4 2.53885 4.55309 0.740686 3.75927 0.0684591Z" fill="white" />
    </svg>
  </div>
);

interface RouterDisplayInfo {
  main: string;
  sub: string;
  isActive: boolean;
  needsAdd: boolean;
  priceText: string;
  noteText: string;
}

function getRouterLabel(state: EquipmentState): RouterDisplayInfo {
  const need = state.router?.need;
  if (need === 'no_thanks' || !need) {
    return { main: 'Дополнить', sub: 'Роутер', isActive: false, needsAdd: true, priceText: '', noteText: '' };
  }
  const purchase = state.router?.purchase;
  if (purchase === 'installment') {
    return {
      main: 'Рассрочка на 24 мес.',
      sub: 'Роутер',
      isActive: true,
      needsAdd: false,
      priceText: '+200 р./мес.',
      noteText: 'только на 24 мес.'
    };
  }
  if (purchase === 'rent') {
    return {
      main: 'Аренда на время',
      sub: 'Роутер',
      isActive: true,
      needsAdd: false,
      priceText: '+80 р./мес.',
      noteText: 'только на время'
    };
  }
  if (purchase === 'buy') {
    return {
      main: 'Покупка',
      sub: 'Роутер',
      isActive: true,
      needsAdd: false,
      priceText: '',
      noteText: 'единоразово'
    };
  }
  return { main: 'Дополнить', sub: 'Роутер', isActive: false, needsAdd: true, priceText: '', noteText: '' };
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

  const { totalMonthly, routerAddOn } = useMemo(() => {
    const base = selectedTariff?.priceValue ?? 0;
    const routerAdd = getRouterAddOnPrice(equipmentState);
    const tvAdd = getTvBoxAddOnPrice(equipmentState);
    const simAdd = getSimAddOnPrice(equipmentState);
    const total = base + routerAdd + tvAdd + simAdd;
    return { totalMonthly: total, routerAddOn: routerAdd };
  }, [selectedTariff?.priceValue, equipmentState]);

  // Handler для роутера - если выбран, убираем выбор; если нет - добавляем
  const handleRouterClick = () => {
    if (routerInfo.needsAdd) {
      // Роутер не выбран - переходим к выбору (устанавливаем need и purchase)
      callbacks.onRouterNeedChange('need');
      callbacks.onRouterPurchaseChange('rent'); // По умолчанию аренда
    } else {
      // Роутер выбран - убираем выбор
      callbacks.onRouterNeedChange('no_thanks');
    }
  };

  // Handler для SIM-карты - как роутер: если не выбрана — добавляем, если выбрана — убираем
  const handleSimClick = () => {
    if (simInfo.isActive) {
      callbacks.onSimConnectionTypeChange('no_thanks');
    } else {
      callbacks.onSimConnectionTypeChange('keep_number');
      callbacks.onSimCountChange(1);
    }
  };

  return (
    <div
      className="flex flex-col w-full flex-1 min-h-0"
      style={{
        fontFamily: 'TT Firs Neue, sans-serif',
      }}
    >
      {/* Spacer: прижимает контент к низу, как в карточках тарифа Frame3 */}
      <div className="flex-1 min-h-0" aria-hidden />

      {/* Основной контейнер — внизу, отступы как в TariffCard */}
      <div
        className="flex flex-col flex-shrink-0 w-full overflow-hidden"
        style={{
          marginTop: 'auto',
          paddingBottom: '15px',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Тариф: провайдер и название — как в TariffCard: 24px 20px 0 20px */}
          <div style={{ padding: '24px 20px 0 20px', position: 'relative' }}>
            <div
              style={{
                fontSize: '14px',
                lineHeight: '125%',
                color: 'rgba(16, 16, 16, 0.5)',
                marginBottom: '4px',
              }}
            >
              {selectedTariff?.providerName ?? 'МТС'}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: '18px',
                  lineHeight: '165%',
                  color: '#101010',
                  fontWeight: 400,
                }}
              >
                {selectedTariff?.tariffName ?? 'РИИЛ. NEW'}
              </span>
              <div style={{ flexShrink: 0 }}>
                <InfoIcon />
              </div>
            </div>
          </div>

          {/* Разделитель — как в TariffCard: 16px 20px 0 20px */}
          <div style={{ padding: '16px 20px 0 20px' }}>
            <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)' }} />
          </div>

          {/* Блок фич — как в TariffCard: padding 16px 20px, между пунктами 14px */}
          <div style={{ padding: '16px 20px' }}>
            {/* Скорость интернета */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
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
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
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
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
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
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
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

            {/* Разделитель перед оборудованием — как в TariffCard */}
            <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)', marginBottom: '14px' }} />

            {/* Роутер */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '14px',
                cursor: 'pointer',
              }}
              onClick={handleRouterClick}
            >
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            {routerInfo.needsAdd ? <PlusCircleRedIcon /> : <MinusCircleIcon />}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  lineHeight: '155%',
                  color: routerInfo.needsAdd ? 'rgba(255, 16, 0, 0.75)' : '#101010',
                }}
              >
                {routerInfo.main}
              </span>
              {routerInfo.priceText && (
                <span
                  style={{
                    fontSize: '14px',
                    lineHeight: '175%',
                    color: 'rgba(16, 16, 16, 0.5)',
                    textAlign: 'right',
                  }}
                >
                  {routerInfo.priceText}
                </span>
              )}
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
                  color: routerInfo.needsAdd ? 'rgba(255, 16, 0, 0.5)' : 'rgba(16, 16, 16, 0.5)',
                }}
              >
                {routerInfo.sub}
              </span>
              {routerInfo.noteText && (
                <span
                  style={{
                    fontSize: '14px',
                    lineHeight: '105%',
                    color: 'rgba(16, 16, 16, 0.5)',
                    textAlign: 'right',
                  }}
                >
                  {routerInfo.noteText}
                </span>
              )}
            </div>
          </div>
            </div>

            {/* TV-приставка */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            {tvInfo.isActive ? <MinusCircleIcon /> : <CrossCircleIcon />}
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

            {/* SIM-карта — кликабельно как роутер */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '14px',
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={handleSimClick}
            >
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            {simInfo.isActive ? <MinusCircleIcon /> : <PlusCircleRedIcon />}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '16px',
                lineHeight: '155%',
                color: simInfo.isActive ? '#101010' : 'rgba(255, 16, 0, 0.75)',
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
                  color: simInfo.isActive ? 'rgba(16, 16, 16, 0.5)' : 'rgba(255, 16, 0, 0.5)',
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
          </div>

          {/* Разделитель перед ценой — как в TariffCard: 0 20px */}
          <div style={{ padding: '0 20px' }}>
            <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)' }} />
          </div>

          {/* Блок цены — как в TariffCard: 16px 20px */}
          <div style={{ padding: '16px 20px' }}>
            <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  fontSize: '22px',
                  lineHeight: '115%',
                  color: '#101010',
                }}
              >
                {totalMonthly} р./мес.
              </div>
              {routerAddOn > 0 && (
                <span
                  style={{
                    fontSize: '14px',
                    lineHeight: '175%',
                    color: '#101010',
                    textAlign: 'right',
                  }}
                >
                  +{routerAddOn} р./мес.
                </span>
              )}
            </div>

            {/* Промо текст и огонёк на одной линии — как в Frame3 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2px',
                minHeight: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  lineHeight: '145%',
                  color: 'rgba(16, 16, 16, 0.5)',
                }}
              >
                {selectedTariff?.promoText ?? '2 месяца по 345 р./мес. по акции'}
              </div>
              <PromoFireIcon />
            </div>
            <div
              style={{
                fontSize: '14px',
                lineHeight: '105%',
                color: 'rgba(16, 16, 16, 0.5)',
              }}
            >
              {selectedTariff?.connectionPrice ?? 'Бесплатное подключение от оператора'}
            </div>
          </div>
        </div>

        {/* Кнопки навигации — как в TariffCard: 0 20px */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            gap: '10px',
            padding: '0 20px',
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
    </div>
  );
}
