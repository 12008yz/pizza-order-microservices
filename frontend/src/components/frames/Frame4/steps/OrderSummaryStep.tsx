'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type {
  EquipmentState,
  RouterNeedOption,
  RouterPurchaseOption,
  TvBoxNeedOption,
  TvBoxPurchaseOption,
  TvCountOption,
  SimSmartphoneCount,
  SimConnectionType,
} from '../types';

const SELECTED_TARIFF_KEY = 'selectedTariff';

// Надбавки к тарифу за оборудование (р./мес.)
const ROUTER_RENT_MONTHLY = 80;
const ROUTER_INSTALLMENT_MONTHLY = 200;
const TV_BOX_RENT_MONTHLY = 80; // аренда за 1 приставку
const TV_BOX_INSTALLMENT_MONTHLY = 200; // рассрочка за 1 приставку (24 мес.)
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
  /** Есть ли в тарифе ТВ (из Frame3) — если false, строку ТВ-приставки нельзя нажимать */
  hasTV?: boolean;
  /** Есть ли в тарифе мобильная связь (из Frame3) — если false, строку SIM нельзя нажимать */
  hasMobile?: boolean;
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
  /** При клике на + у роутера — перейти в модалку выбора роутера, затем снова на итоговую карточку */
  onGoToRouterStep?: () => void;
  /** При клике на + у ТВ-приставки — перейти в модалку выбора ТВ, затем снова на итоговую карточку */
  onGoToTvBoxStep?: () => void;
  /** При клике на + у SIM — перейти в модалку выбора SIM, затем снова на итоговую карточку */
  onGoToSimStep?: () => void;
  callbacks: OrderSummaryCallbacks;
}

// Галочка: белый фон, чёрный border, чёрная галочка (16×16)
const CheckIconSvg = () => (
  <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
    <path d="M1 3L3 5L7 1" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckCircleIcon = ({ active = true }: { active?: boolean }) => (
  <div
    className="rounded-full flex items-center justify-center flex-shrink-0"
    style={{
      width: 16,
      height: 16,
      boxSizing: 'border-box',
      border: active ? '1px solid #101010' : '1px solid rgba(16, 16, 16, 0.25)',
      background: active ? '#FFFFFF' : 'transparent',
    }}
  >
    {active && <CheckIconSvg />}
  </div>
);

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

// Иконка минуса в круге — чёрный фон, белый минус (кнопка отмены/удаления)
const MinusCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="#101010" />
    <path d="M5 8H11" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

import InfoIcon from '../../../common/icons/InfoIcon';

// Стрелка назад (как в других шагах Frame4)
const BackArrowIcon = () => (
  <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}>
    <path d="M0.112544 5.34082L5.70367 0.114631C5.7823 0.0412287 5.88888 -5.34251e-07 6 -5.24537e-07C6.11112 -5.14822e-07 6.2177 0.0412287 6.29633 0.114631L11.8875 5.34082C11.9615 5.41513 12.0019 5.5134 11.9999 5.61495C11.998 5.7165 11.954 5.81338 11.8772 5.8852C11.8004 5.95701 11.6967 5.99815 11.5881 5.99994C11.4794 6.00173 11.3743 5.96404 11.2948 5.8948L6 0.946249L0.705204 5.8948C0.625711 5.96404 0.520573 6.00173 0.411936 5.99994C0.3033 5.99815 0.199649 5.95701 0.12282 5.88519C0.04599 5.81338 0.00198176 5.71649 6.48835e-05 5.61495C-0.00185199 5.5134 0.0384722 5.41513 0.112544 5.34082Z" fill="#101010" />
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
  /** Выбор пользователя: Аренда / Покупка / Рассрочка — показывается напротив роутера */
  choiceLabel: string;
}

function getRouterLabel(state: EquipmentState): RouterDisplayInfo {
  const need = state.router?.need;

  // Роутер не выбран / снят минусом — показываем «Дополнить» красным, как у TV и SIM
  if (need === 'no_thanks' || !need) {
    return { main: 'Дополнить', sub: 'Роутер', isActive: false, needsAdd: true, priceText: '', noteText: '', choiceLabel: '' };
  }

  // Роутер есть от оператора — не требуется, без доп. платы
  if (need === 'from_operator') {
    return { main: 'Роутер не требуется', sub: 'Роутер', isActive: true, needsAdd: false, priceText: '', noteText: 'имеется от оператора', choiceLabel: '' };
  }

  // Роутер свой (не от оператора) — либо настройка за 200 р., либо настройка не требуется
  if (need === 'own') {
    const config = state.router?.config;
    if (config === 'with_config') {
      return {
        main: 'Настройка за 200 р.',
        sub: 'Роутер',
        isActive: true,
        needsAdd: false,
        priceText: '200 р.',
        noteText: 'единоразово',
        choiceLabel: '',
      };
    }
    return { main: 'Роутер не требуется', sub: 'Роутер', isActive: true, needsAdd: false, priceText: '', noteText: 'настройка не требуется', choiceLabel: '' };
  }

  // Роутер нужен — показываем выбранный вариант: аренда / покупка / рассрочка
  if (need === 'need') {
    const purchase = state.router?.purchase;
    if (purchase === 'installment') {
      return {
        main: 'Рассрочка на 24 мес.',
        sub: 'Роутер',
        isActive: true,
        needsAdd: false,
        priceText: '+200 р./мес.',
        noteText: 'только на 24 мес.',
        choiceLabel: 'Рассрочка',
      };
    }
    if (purchase === 'rent') {
      return {
        main: 'Аренда на время',
        sub: 'Роутер',
        isActive: true,
        needsAdd: false,
        priceText: '+80 р./мес.',
        noteText: 'только на время',
        choiceLabel: 'Аренда',
      };
    }
    if (purchase === 'buy') {
      return {
        main: 'Покупка',
        sub: 'Роутер',
        isActive: true,
        needsAdd: false,
        priceText: '',
        noteText: 'единоразово',
        choiceLabel: 'Покупка',
      };
    }
  }

  // Не выбрано или неизвестное состояние — предлагаем дополнить
  return { main: 'Дополнить', sub: 'Роутер', isActive: false, needsAdd: true, priceText: '', noteText: '', choiceLabel: '' };
}

function getRouterAddOnPrice(state: EquipmentState): number {
  const need = state.router?.need;
  if (need === 'no_thanks' || need === 'from_operator' || need === 'own') return 0; // нет ежемесячной надбавки
  if (need === 'need') {
    if (state.router?.purchase === 'rent') return ROUTER_RENT_MONTHLY;
    if (state.router?.purchase === 'installment') return ROUTER_INSTALLMENT_MONTHLY;
  }
  return 0;
}

interface TvBoxDisplayInfo {
  main: string;
  sub: string;
  isActive: boolean;
  priceText: string;
  noteText: string;
  /** Рассрочка / Аренда / Покупка — показывается напротив ТВ-приставки, как у роутера */
  choiceLabel: string;
  /** Как блок «Не предусмотрено / Телевидение»: серая иконка, серый текст, нельзя нажать и изменить */
  isReadOnly?: boolean;
}

function getTvBoxDisplayInfo(state: EquipmentState): TvBoxDisplayInfo {
  const need = state.tvBox?.need;
  const n = state.tvBox?.tvCount ?? 1;
  const sub = n > 1 ? `TV-приставка · ${n} шт.` : 'TV-приставка';

  if (need === 'need') {
    const purchase = state.tvBox?.purchaseOption;
    if (purchase === 'installment') {
      return {
        main: 'Рассрочка на 24 мес.',
        sub,
        isActive: true,
        priceText: n > 1 ? `+${n * TV_BOX_INSTALLMENT_MONTHLY} р./мес.` : '+200 р./мес.',
        noteText: 'только на 24 мес.',
        choiceLabel: 'Рассрочка',
      };
    }
    if (purchase === 'rent') {
      return {
        main: 'Аренда на время',
        sub,
        isActive: true,
        priceText: n > 1 ? `+${n * TV_BOX_RENT_MONTHLY} р./мес.` : '+80 р./мес.',
        noteText: 'только на время',
        choiceLabel: 'Аренда',
      };
    }
    if (purchase === 'buy') {
      return {
        main: 'Покупка',
        sub,
        isActive: true,
        priceText: '',
        noteText: 'единоразово',
        choiceLabel: 'Покупка',
      };
    }
    // выбор ещё не сделан — показываем количество и заголовок
    return {
      main: `TV-приставка · ${n} шт.`,
      sub: 'TV-приставка',
      isActive: true,
      priceText: '',
      noteText: '',
      choiceLabel: '',
    };
  }

  // «Имеется в телевизоре интернет» — чёрный текст и минус
  if (need === 'smart_tv') {
    return { main: 'Имеется в телевизоре интернет', sub: 'TV-приставка', isActive: true, priceText: '', noteText: '', choiceLabel: '' };
  }

  // После нажатия минус — красный «Дополнить», как у роутера
  if (need === 'no_thanks') {
    return { main: 'Дополнить', sub: 'TV-приставка', isActive: false, priceText: '', noteText: '', choiceLabel: '' };
  }

  // «Имеется, но, от оператора» — как у роутера: чёрный текст, минус, справа «имеется от оператора»
  if (need === 'have_from_operator') {
    return { main: 'Не требуется', sub: 'TV-приставка', isActive: true, priceText: '', noteText: '', choiceLabel: '' };
  }
  // «Имеется, но, не от оператора» — серый блок, нельзя нажать
  if (need === 'have_own') {
    return { main: 'Не предусмотрено', sub: 'TV-приставка', isActive: false, priceText: '', noteText: '', choiceLabel: '', isReadOnly: true };
  }

  return { main: 'Не предусмотрено', sub: 'TV-приставка', isActive: false, priceText: '', noteText: '', choiceLabel: '' };
}

function getTvBoxAddOnPrice(state: EquipmentState): number {
  if (state.tvBox?.need !== 'need') return 0;
  const n = state.tvBox?.tvCount ?? 1;
  const purchase = state.tvBox?.purchaseOption;
  if (purchase === 'rent') return n * TV_BOX_RENT_MONTHLY;
  if (purchase === 'installment') return n * TV_BOX_INSTALLMENT_MONTHLY;
  if (purchase === 'buy') return 0;
  return 0;
}

function getSimLabel(state: EquipmentState): { main: string; sub: string; extra: string; isActive: boolean } {
  const type = state.simCard?.connectionType;
  if (type === 'no_thanks' || !type) {
    return { main: 'Дополнить', sub: 'SIM-карта', extra: '', isActive: false };
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
  onGoToRouterStep,
  onGoToTvBoxStep,
  onGoToSimStep,
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

  const routerInfo = getRouterLabel(equipmentState);
  const tvInfo = getTvBoxDisplayInfo(equipmentState);
  const simInfo = getSimLabel(equipmentState);

  const hasTVTariff = selectedTariff?.hasTV !== false;
  const hasMobileTariff = selectedTariff?.hasMobile !== false;

  const { totalMonthly, totalAddOn } = useMemo(() => {
    const base = selectedTariff?.priceValue ?? 0;
    const routerAdd = getRouterAddOnPrice(equipmentState);
    const tvAdd = getTvBoxAddOnPrice(equipmentState);
    const simAdd = getSimAddOnPrice(equipmentState);
    const addOn = routerAdd + tvAdd + simAdd;
    return { totalMonthly: base + addOn, totalAddOn: addOn };
  }, [selectedTariff?.priceValue, equipmentState]);

  // Handler для роутера - если выбран, убираем выбор; если нет - переходим в модалку выбора и затем снова на итоговую
  const handleRouterClick = () => {
    if (routerInfo.needsAdd) {
      if (onGoToRouterStep) {
        onGoToRouterStep(); // переход в модалку роутера, после выбора — снова на итоговую карточку
      } else {
        callbacks.onRouterNeedChange('need');
        callbacks.onRouterPurchaseChange('rent');
      }
    } else {
      callbacks.onRouterNeedChange('no_thanks');
    }
  };

  // Handler для ТВ-приставки: если выбрана — минус (уменьшить кол-во или снять в «Дополнить»); если «Дополнить» — в модалку выбора
  const handleTvBoxClick = () => {
    if (tvInfo.isActive) {
      const current = equipmentState.tvBox?.tvCount ?? 1;
      const need = equipmentState.tvBox?.need;
      if (current > 1) {
        callbacks.onTvBoxCountChange((current - 1) as TvCountOption);
      } else {
        // Снятие выбора (аренда/рассрочка/покупка или «интернет в телеке») → везде «Дополнить» красным
        callbacks.onTvBoxNeedChange('no_thanks');
      }
    } else {
      if (onGoToTvBoxStep) {
        onGoToTvBoxStep();
      } else {
        callbacks.onTvBoxNeedChange('need');
        callbacks.onTvBoxCountChange(1);
      }
    }
  };

  // Handler для SIM-карты: если не выбрана — переходим в модалку выбора и затем снова на итоговую; если выбрана — убираем
  const handleSimClick = () => {
    if (simInfo.isActive) {
      callbacks.onSimConnectionTypeChange('no_thanks');
    } else {
      if (onGoToSimStep) {
        onGoToSimStep(); // переход в модалку SIM, после выбора — снова на итоговую карточку
      } else {
        callbacks.onSimConnectionTypeChange('keep_number');
        callbacks.onSimCountChange(1);
      }
    }
  };

  // Отступы по макету: по 15px по бокам и снизу
  const padCardTop = 15;
  const padCardBottom = 10;
  const padCardLeft = 15;
  const padCardRight = 15;
  const padBlockV = 10; // отступ сверху от разделителя до первой строки (скорость)
  const rowMinH = 40;
  const rowGap = 5;        // 5px между рядами фич/оборудования
  const pricePadTop = 20;  // 20px от разделителя до цены
  const priceToButtons = 20; // 20px от «Подключение от оператора» до кнопок
  const padBottom = 15;   // 15px от низа кнопок до низа карточки
  const dividerToBlock = 10; // 10px от последней фичи до разделителя оборудования

  return (
    <div
      className="flex flex-col w-full"
      style={{
        fontFamily: 'TT Firs Neue, sans-serif',
      }}
    >
      {/* Контент сверху, 20px от «Подключение от оператора» до кнопок, кнопки и 20px снизу — без растягивания по высоте */}
      <div
        className="flex flex-col w-full overflow-hidden"
        style={{
          paddingBottom: `${padBottom}px`,
          boxSizing: 'border-box',
        }}
      >
        {/* Блок тарифа, фич и цены — высота по контенту (не растягивается), чтобы до кнопок было ровно 20px */}
        <div
          className="overflow-hidden"
          style={{ flexShrink: 0 }}
        >
          {/* Тариф: по макету 15 15 10 17 (top right bottom left) */}
          <div style={{ padding: `${padCardTop}px ${padCardRight}px ${padCardBottom}px ${padCardLeft}px`, position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: `${rowGap}px`,
              }}
            >
              <span
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '125%',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgba(16, 16, 16, 0.5)',
                }}
              >
                {selectedTariff?.providerName ?? 'МТС'}
              </span>
              <div style={{ flexShrink: 0 }}>
                <InfoIcon />
              </div>
            </div>
            <div
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontWeight: 400,
                fontSize: '18px',
                lineHeight: '165%',
                display: 'flex',
                alignItems: 'center',
                color: '#101010',
              }}
            >
              {selectedTariff?.tariffName ?? 'РИИЛ. NEW'}
            </div>
          </div>

          {/* Разделитель: 330px по макету, 10px от блока тарифа (padCardBottom) */}
          <div style={{ padding: `0 ${padCardRight}px 0 ${padCardLeft}px` }}>
            <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)', maxWidth: '330px' }} />
          </div>

          {/* Блок фич: 10px сверху (от серой полоски до скорости), 5px между рядами, 10px до разделителя оборудования */}
          <div style={{ padding: `${padBlockV}px ${padCardRight}px 0 ${padCardLeft}px` }}>
            {/* Скорость интернета */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: `${rowGap}px`, minHeight: `${rowMinH}px` }}>
              <div style={{ marginRight: '12px', flexShrink: 0 }}>
                <CheckCircleIcon active={true} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '16px', lineHeight: '155%', color: '#101010', wordBreak: 'break-word' }}>
                  {selectedTariff?.speed ?? '500 Мбит/сек'}
                </div>
                <div style={{ fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.5)', wordBreak: 'break-word' }}>
                  {selectedTariff?.speedDesc ?? 'Безлимитное соединение в квартире'}
                </div>
              </div>
            </div>

            {/* Телевидение - Не предусмотрено */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: `${rowGap}px`, minHeight: `${rowMinH}px` }}>
              <div style={{ marginRight: '12px', flexShrink: 0 }}>
                <CrossCircleIcon />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '16px', lineHeight: '155%', color: 'rgba(16, 16, 16, 0.25)', wordBreak: 'break-word' }}>Не предусмотрено</div>
                <div style={{ fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.5)', wordBreak: 'break-word' }}>Телевидение</div>
              </div>
            </div>

            {/* Мобильное соединение */}
            {selectedTariff?.mobile && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: `${rowGap}px`, minHeight: `${rowMinH}px` }}>
                <div style={{ marginRight: '12px', flexShrink: 0 }}>
                  <CheckCircleIcon active={true} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '16px', lineHeight: '155%', color: '#101010', wordBreak: 'break-word' }}>{selectedTariff.mobile}</div>
                  <div style={{ fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.5)', wordBreak: 'break-word' }}>{selectedTariff.mobileDesc ?? 'Мобильное соединение'}</div>
                </div>
              </div>
            )}

            {/* Кинотеатр KION */}
            {selectedTariff?.favoriteLabel && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: `${rowGap}px`, minHeight: `${rowMinH}px` }}>
                <div style={{ marginRight: '12px', flexShrink: 0 }}>
                  <CheckCircleIcon active={true} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '16px', lineHeight: '155%', color: '#101010', wordBreak: 'break-word' }}>{selectedTariff.favoriteLabel}</div>
                  <div style={{ fontSize: '14px', lineHeight: '105%', color: 'rgba(16, 16, 16, 0.5)', wordBreak: 'break-word' }}>{selectedTariff.favoriteDesc ?? 'Дополнительное приложение'}</div>
                </div>
              </div>
            )}

            {/* Разделитель перед оборудованием — 10px от последней фичи (330×10 по макету) */}
            <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)', marginTop: `${dividerToBlock}px`, marginBottom: `${rowGap}px`, maxWidth: '330px' }} />

            {/* Роутер — три колонки: иконка | main+sub | правый блок по правому краю (marginLeft: auto) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: `${rowGap}px`,
                minHeight: `${rowMinH}px`,
                maxWidth: '330px',
                cursor: 'pointer',
              }}
              onClick={handleRouterClick}
            >
              <div style={{ width: '16px', height: '16px', flexShrink: 0, marginRight: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {routerInfo.needsAdd ? <PlusCircleRedIcon /> : <MinusCircleIcon />}
              </div>
              <div style={{ flex: 1, minWidth: 0, maxWidth: '170px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
                <span
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '16px',
                    lineHeight: '155%',
                    color: routerInfo.needsAdd ? 'rgba(255, 16, 0, 0.75)' : '#101010',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {routerInfo.main}
                </span>
                <span
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '14px',
                    lineHeight: '105%',
                    color: routerInfo.needsAdd ? 'rgba(255, 16, 0, 0.5)' : 'rgba(16, 16, 16, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {routerInfo.sub}
                </span>
              </div>
              <div
                style={{
                  width: '120px',
                  flexShrink: 0,
                  marginLeft: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: 0,
                  textAlign: 'right',
                }}
              >
                {(routerInfo.priceText || routerInfo.choiceLabel) && (
                  <span
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontSize: '14px',
                      lineHeight: '175%',
                      color: 'rgba(16, 16, 16, 0.5)',
                    }}
                  >
                    {routerInfo.priceText || routerInfo.choiceLabel}
                  </span>
                )}
                {routerInfo.noteText && (
                  <span
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontSize: '14px',
                      lineHeight: '105%',
                      color: 'rgba(16, 16, 16, 0.5)',
                    }}
                  >
                    {routerInfo.noteText}
                  </span>
                )}
              </div>
            </div>

            {/* TV-приставка — если в тарифе нет ТВ или isReadOnly: как блок «Не предусмотрено / Телевидение» — серая иконка, серый текст, не кликается */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: `${rowGap}px`,
                minHeight: `${rowMinH}px`,
                maxWidth: '330px',
                cursor: tvInfo.isReadOnly || !hasTVTariff ? 'default' : 'pointer',
              }}
              onClick={tvInfo.isReadOnly || !hasTVTariff ? undefined : handleTvBoxClick}
            >
              <div style={{ width: '16px', height: '16px', flexShrink: 0, marginRight: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {tvInfo.isReadOnly || !hasTVTariff ? <CrossCircleIcon /> : !tvInfo.isActive ? <PlusCircleRedIcon /> : <MinusCircleIcon />}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
                <span
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '16px',
                    lineHeight: '155%',
                    color: tvInfo.isReadOnly || !hasTVTariff ? 'rgba(16, 16, 16, 0.25)' : tvInfo.isActive ? '#101010' : 'rgba(255, 16, 0, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {!hasTVTariff ? 'Не предусмотрено' : tvInfo.main}
                </span>
                <span
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '14px',
                    lineHeight: '105%',
                    color: tvInfo.isReadOnly || !hasTVTariff ? 'rgba(16, 16, 16, 0.5)' : tvInfo.isActive ? 'rgba(16, 16, 16, 0.5)' : 'rgba(255, 16, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {tvInfo.sub}
                </span>
              </div>
              <div
                style={{
                  width: !hasTVTariff ? 0 : (tvInfo.priceText || tvInfo.choiceLabel || tvInfo.noteText) ? '120px' : 0,
                  flexShrink: 0,
                  marginLeft: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: 0,
                  textAlign: 'right',
                  overflow: 'hidden',
                }}
              >
                {(tvInfo.priceText || tvInfo.choiceLabel) && (
                  <span
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontSize: '14px',
                      lineHeight: '175%',
                      color: 'rgba(16, 16, 16, 0.5)',
                    }}
                  >
                    {tvInfo.priceText || tvInfo.choiceLabel}
                  </span>
                )}
                {tvInfo.noteText && (
                  <span
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontSize: '14px',
                      lineHeight: '105%',
                      color: 'rgba(16, 16, 16, 0.5)',
                    }}
                  >
                    {tvInfo.noteText}
                  </span>
                )}
              </div>
            </div>

            {/* SIM-карта — строка 1 заголовок, строка 2 «SIM-карта» и «один экз.»; если в тарифе нет мобильной связи — неактивная строка как «Не предусмотрено» */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: `${rowGap}px`,
                minHeight: `${rowMinH}px`,
                maxWidth: '330px',
                position: 'relative',
                cursor: hasMobileTariff ? 'pointer' : 'default',
              }}
              onClick={hasMobileTariff ? handleSimClick : undefined}
            >
              <div style={{ width: '16px', height: '16px', flexShrink: 0, marginRight: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!hasMobileTariff ? <CrossCircleIcon /> : simInfo.isActive ? <MinusCircleIcon /> : <PlusCircleRedIcon />}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '16px',
                    lineHeight: '155%',
                    color: !hasMobileTariff ? 'rgba(16, 16, 16, 0.25)' : simInfo.isActive ? '#101010' : 'rgba(255, 16, 0, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {simInfo.main}
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontSize: '14px',
                      lineHeight: '105%',
                      color: !hasMobileTariff ? 'rgba(16, 16, 16, 0.5)' : simInfo.isActive ? 'rgba(16, 16, 16, 0.5)' : 'rgba(255, 16, 0, 0.5)',
                    }}
                  >
                    {simInfo.sub}
                  </span>
                  {simInfo.extra && (
                    <span
                      style={{
                        fontFamily: 'TT Firs Neue, sans-serif',
                        fontSize: '14px',
                        lineHeight: '105%',
                        color: 'rgba(16, 16, 16, 0.5)',
                        flexShrink: 0,
                      }}
                    >
                      {simInfo.extra}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Разделитель перед ценой — 10px от блока оборудования, 20px до цены */}
          <div style={{ padding: `0 ${padCardRight}px 0 ${padCardLeft}px`, marginTop: '10px' }}>
            <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)', maxWidth: '330px' }} />
          </div>

          {/* Блок цены — 20px от разделителя до «695 р./мес.» */}
          <div style={{ padding: `${pricePadTop}px ${padCardRight}px 0 ${padCardLeft}px` }}>
            <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
              <div
                style={{
                  fontSize: '22px',
                  lineHeight: '115%',
                  color: '#101010',
                }}
              >
                {totalMonthly} р./мес.
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', lineHeight: '175%', color: '#101010' }}>
                {totalAddOn > 0 && <span>+{totalAddOn} р./мес.</span>}
              </div>
            </div>

            {/* Промо текст и огонёк на одной линии */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '5px',
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
                lineHeight: '145%',
                color: 'rgba(16, 16, 16, 0.5)',
                marginBottom: `${priceToButtons}px`,
              }}
            >
              {selectedTariff?.connectionPrice ?? 'Бесплатное подключение от оператора'}
            </div>
          </div>
        </div>

        {/* Кнопки — 5px между кнопками, 20px сверху от «Подключение от оператора» */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            gap: '5px',
            padding: `0 ${padCardRight}px 0 ${padCardLeft}px`,
          }}
        >
        {/* Кнопка «Назад» — стрелка влево, как на других шагах */}
        <button
          type="button"
          onClick={onBack}
          onMouseDown={() => setIsBackPressed(true)}
          onMouseUp={() => setIsBackPressed(false)}
          onMouseLeave={() => setIsBackPressed(false)}
          onTouchStart={() => setIsBackPressed(true)}
          onTouchEnd={() => setIsBackPressed(false)}
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
            transform: isBackPressed ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.15s ease-out',
          }}
          aria-label="Назад"
        >
          <BackArrowIcon />
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
