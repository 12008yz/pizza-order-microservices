'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  RouterNeedStep,
  RouterPurchaseStep,
  RouterOperatorStep,
  RouterConfigStep,
  TvBoxNeedStep,
  TvBoxTvCountStep,
  TvBoxPurchaseStep,
  TvBoxOperatorStep,
  SimConnectionTypeStep,
  SimClientStatusStep,
  SimSmartphoneCountStep,
  SimOperatorStep,
  SimInfoStep,
  OrderSummaryStep,
} from './steps';
import { ClickOutsideHintContent, HINT_TOP } from '../../common/ClickOutsideHint';
import { CloseIcon, HomeIcon, PlaneIcon } from '../../common/icons';

const ConsultationFlow = dynamic(() => import('../Frame2/ConsultationFlow'), {
  loading: () => <div>Загрузка...</div>,
  ssr: false,
});
import type {
  RouterNeedOption,
  RouterPurchaseOption,
  RouterOperatorOption,
  RouterConfigOption,
  EquipmentState,
  TvBoxNeedOption,
  TvCountOption,
  TvBoxPurchaseOption,
  TvBoxOperatorOption,
  SimConnectionType,
  SimClientStatus,
  SimSmartphoneCount,
  SimOperatorOption,
} from './types';
import { AddressProvider } from '../../../contexts/AddressContext';
import { useEquipment } from '../../../contexts/EquipmentContext';
import LoadingScreen from '../../LoadingScreen';

const defaultTvBox = {
  need: null as TvBoxNeedOption | null,
  tvCount: null as TvCountOption | null,
  purchaseOption: null as TvBoxPurchaseOption | null,
  operatorId: null as TvBoxOperatorOption | null,
};

const defaultSimCard = {
  connectionType: null as SimConnectionType | null,
  clientStatus: null as SimClientStatus | null,
  smartphoneCount: null as SimSmartphoneCount | null,
  currentOperator: null as SimOperatorOption | null,
};

const defaultEquipmentState: EquipmentState = {
  router: {
    need: 'need',
    purchase: 'buy',
    operator: null,
    config: null,
  },
  tvBox: defaultTvBox,
  simCard: defaultSimCard,
};

type Step =
  | 'router_need'
  | 'router_purchase'
  | 'router_operator'
  | 'router_config'
  | 'tvbox_need'
  | 'tvbox_tvcount'
  | 'tvbox_purchase'
  | 'tvbox_operator'
  | 'sim_connection_type'
  | 'sim_client_status'
  | 'sim_info_person'
  | 'sim_info_region'
  | 'sim_smartphone_count'
  | 'sim_operator'
  | 'order_summary';

const FRAME4_FLOW_STORAGE_KEY = 'frame4Flow';
const SELECTED_TARIFF_KEY = 'selectedTariff';
const VALID_STEPS: Step[] = [
  'router_need', 'router_purchase', 'router_operator', 'router_config',
  'tvbox_need', 'tvbox_tvcount', 'tvbox_purchase', 'tvbox_operator',
  'sim_connection_type', 'sim_client_status', 'sim_info_person', 'sim_info_region',
  'sim_smartphone_count', 'sim_operator', 'order_summary',
];

const TVBOX_STEPS: Step[] = ['tvbox_need', 'tvbox_tvcount', 'tvbox_purchase', 'tvbox_operator'];
const SIM_STEPS: Step[] = ['sim_connection_type', 'sim_client_status', 'sim_info_person', 'sim_info_region', 'sim_smartphone_count', 'sim_operator'];

function getTariffFlags(): { hasTV: boolean; hasMobile: boolean } {
  if (typeof window === 'undefined') return { hasTV: true, hasMobile: true };
  try {
    const raw = sessionStorage.getItem(SELECTED_TARIFF_KEY);
    if (!raw) return { hasTV: true, hasMobile: true };
    const t = JSON.parse(raw) as { hasTV?: boolean; hasMobile?: boolean };
    return {
      hasTV: t.hasTV !== false,
      hasMobile: t.hasMobile !== false,
    };
  } catch {
    return { hasTV: true, hasMobile: true };
  }
}

function loadFrame4FlowFromStorage(): { step: Step; lastStepBeforeOrderSummary: Step | null; returnToOrderSummaryAfter: 'router' | 'tvbox' | 'sim' | null } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(FRAME4_FLOW_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { currentStep?: string; lastStepBeforeOrderSummary?: string | null; returnToOrderSummaryAfter?: string | null };
    const step = data.currentStep && VALID_STEPS.includes(data.currentStep as Step) ? (data.currentStep as Step) : null;
    const lastStep = data.lastStepBeforeOrderSummary && VALID_STEPS.includes(data.lastStepBeforeOrderSummary as Step) ? (data.lastStepBeforeOrderSummary as Step) : null;
    const returnTo = data.returnToOrderSummaryAfter === 'router' || data.returnToOrderSummaryAfter === 'tvbox' || data.returnToOrderSummaryAfter === 'sim' ? data.returnToOrderSummaryAfter : null;
    if (!step) return null;
    return { step, lastStepBeforeOrderSummary: lastStep, returnToOrderSummaryAfter: returnTo };
  } catch {
    return null;
  }
}

function saveFrame4FlowToStorage(currentStep: Step, lastStepBeforeOrderSummary: Step | null, returnToOrderSummaryAfter: 'router' | 'tvbox' | 'sim' | null) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(FRAME4_FLOW_STORAGE_KEY, JSON.stringify({
      currentStep,
      lastStepBeforeOrderSummary,
      returnToOrderSummaryAfter,
    }));
  } catch {
    // ignore
  }
}

function Frame4Content() {
  const router = useRouter();
  const { equipmentState: savedEquipment, setEquipmentState: saveEquipment } = useEquipment();

  const [equipmentState, setEquipmentState] = useState<EquipmentState>(() => ({
    ...defaultEquipmentState,
    ...savedEquipment,
    tvBox: { ...defaultTvBox, ...savedEquipment?.tvBox },
    simCard: { ...defaultSimCard, ...savedEquipment?.simCard },
  }));

  // Показывать ли баннер с предупреждением о смартфонах
  const [showSimCountWarning, setShowSimCountWarning] = useState(false);
  // Модалка консультации (в хедере — всегда доступна, в т.ч. на шаге итогового тарифа)
  const [showConsultation, setShowConsultation] = useState(false);
  // Экран загрузки при переходе на 5 фрейм (страница заказа)
  const [showLoadingToOrder, setShowLoadingToOrder] = useState(false);
  // После отмены с итоговой карточки: при + на роутере/ТВ/SIM ведём в модалку выбора, затем снова на итоговую
  const [returnToOrderSummaryAfter, setReturnToOrderSummaryAfter] = useState<'router' | 'tvbox' | 'sim' | null>(null);
  // С какого шага пришли на итоговую карточку — по «Назад» возвращаем именно туда, а не в модалку SIM
  const [lastStepBeforeOrderSummary, setLastStepBeforeOrderSummary] = useState<Step | null>(null);

  const [currentStep, setCurrentStep] = useState<Step>('router_need');

  // Флаги тарифа из Frame3: если в тарифе нет ТВ/мобильной связи — соответствующие шаги пропускаем
  const [tariffFlags, setTariffFlags] = useState<{ hasTV: boolean; hasMobile: boolean }>(() => getTariffFlags());
  const { hasTV, hasMobile } = tariffFlags;

  // Восстановление шага и флагов из sessionStorage при монтировании; учёт тарифа (пропуск ТВ/SIM если их нет в тарифе)
  useEffect(() => {
    const flags = getTariffFlags();
    setTariffFlags(flags);
    const saved = loadFrame4FlowFromStorage();
    if (saved) {
      setCurrentStep(saved.step);
      if (saved.lastStepBeforeOrderSummary != null) setLastStepBeforeOrderSummary(saved.lastStepBeforeOrderSummary);
      if (saved.returnToOrderSummaryAfter != null) setReturnToOrderSummaryAfter(saved.returnToOrderSummaryAfter);
      const step = saved.step;
      if (TVBOX_STEPS.includes(step as Step) && !flags.hasTV) {
        setCurrentStep(flags.hasMobile ? 'sim_connection_type' : 'order_summary');
      } else if (SIM_STEPS.includes(step as Step) && !flags.hasMobile) {
        setCurrentStep('order_summary');
      }
    } else {
      setEquipmentState((prev) => ({
        ...prev,
        tvBox: flags.hasTV ? prev.tvBox : { ...defaultTvBox, need: 'smart_tv' as const },
        simCard: flags.hasMobile ? prev.simCard : { ...defaultSimCard, connectionType: 'no_thanks' as const },
      }));
    }
  }, []);

  // Сохранение шага и флагов в sessionStorage при каждом изменении (чтобы не терять место при переключении вкладок)
  useEffect(() => {
    saveFrame4FlowToStorage(currentStep, lastStepBeforeOrderSummary, returnToOrderSummaryAfter);
  }, [currentStep, lastStepBeforeOrderSummary, returnToOrderSummaryAfter]);

  // Инициализация из сохранённого выбора при монтировании (с учётом тарифа: ТВ/SIM не подставляем, если их нет в тарифе)
  useEffect(() => {
    if (savedEquipment) {
      const flags = getTariffFlags();
      setEquipmentState((prev) => ({
        ...prev,
        ...savedEquipment,
        tvBox: flags.hasTV ? { ...defaultTvBox, ...savedEquipment.tvBox } : { ...defaultTvBox, need: 'smart_tv' as const },
        simCard: flags.hasMobile ? { ...defaultSimCard, ...savedEquipment.simCard } : { ...defaultSimCard, connectionType: 'no_thanks' as const },
      }));
    }
  }, []);

  // Всегда сохраняем выбор в контекст (и в sessionStorage) при изменении
  useEffect(() => {
    saveEquipment(equipmentState);
  }, [equipmentState, saveEquipment]);

  const goToOrderSummary = useCallback(() => {
    setLastStepBeforeOrderSummary(currentStep);
    setCurrentStep('order_summary');
    setReturnToOrderSummaryAfter(null);
  }, [currentStep]);

  // Прелоад Frame5 при показе итоговой карточки, чтобы переход по «Подключить» не показывал пустой экран
  useEffect(() => {
    if (currentStep === 'order_summary') {
      import('../Frame5');
    }
  }, [currentStep]);

  // Уведомления над карточкой, 75px от верха (как во Frame2)
  type NotificationType = 'router_operator' | 'tvbox_operator' | 'tvbox_tvcount' | 'tvbox_own' | 'sim_smartphone';
  const [frameNotification, setFrameNotification] = useState<{ type: NotificationType; countdown: number } | null>(null);
  const closedNotificationTypeRef = useRef<NotificationType | null>(null);

  const closeFrameNotification = () => {
    if (frameNotification?.type === 'sim_smartphone') setShowSimCountWarning(false);
    setFrameNotification(null);
  };

  useEffect(() => {
    // Уведомление показываем на всех шагах, кроме когда выбран ДОМ.RU (для шагов выбора оператора)
    const routerOperator = equipmentState.router.operator;
    const tvBoxOperator = equipmentState.tvBox?.operatorId;
    const isDomRuRouter = routerOperator === 'domru';
    const isDomRuTvBox = tvBoxOperator === 'domru';

    if (currentStep === 'router_operator' && routerOperator != null && !isDomRuRouter) {
      setFrameNotification((prev) => (prev?.type === 'router_operator' ? prev : { type: 'router_operator', countdown: 7 }));
    } else if (currentStep === 'tvbox_operator' && tvBoxOperator != null && !isDomRuTvBox) {
      setFrameNotification((prev) => (prev?.type === 'tvbox_operator' ? prev : { type: 'tvbox_operator', countdown: 7 }));
    } else if (currentStep === 'tvbox_tvcount' && (equipmentState.tvBox?.tvCount ?? 0) > 1) {
      setFrameNotification((prev) => (prev?.type === 'tvbox_tvcount' ? prev : { type: 'tvbox_tvcount', countdown: 7 }));
    } else if (currentStep === 'tvbox_need' && equipmentState.tvBox?.need === 'have_own') {
      setFrameNotification((prev) => (prev?.type === 'tvbox_own' ? prev : { type: 'tvbox_own', countdown: 7 }));
    } else if (currentStep === 'sim_smartphone_count' && showSimCountWarning) {
      setFrameNotification((prev) => (prev?.type === 'sim_smartphone' ? prev : { type: 'sim_smartphone', countdown: 7 }));
    } else {
      setFrameNotification(null);
    }
  }, [currentStep, equipmentState.router.operator, equipmentState.tvBox?.operatorId, equipmentState.tvBox?.tvCount, equipmentState.tvBox?.need, showSimCountWarning]);

  useEffect(() => {
    if (frameNotification == null || frameNotification.countdown <= 0) return;
    const t = setInterval(() => {
      setFrameNotification((prev) => {
        if (prev == null) return null;
        if (prev.countdown <= 1) {
          closedNotificationTypeRef.current = prev.type;
          return null;
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [frameNotification?.countdown, frameNotification != null]);

  useEffect(() => {
    if (frameNotification === null && closedNotificationTypeRef.current !== null) {
      const t = closedNotificationTypeRef.current;
      closedNotificationTypeRef.current = null;
      if (t === 'sim_smartphone') setShowSimCountWarning(false);
    }
  }, [frameNotification]);

  const handleRouterNeedSelect = (option: RouterNeedOption) => {
    setEquipmentState((prev) => ({
      ...prev,
      router: {
        ...prev.router,
        need: option,
      },
    }));
  };

  const handleRouterPurchaseSelect = (option: RouterPurchaseOption) => {
    setEquipmentState((prev) => ({
      ...prev,
      router: {
        ...prev.router,
        purchase: option,
      },
    }));
  };

  const handleRouterOperatorSelect = (operator: RouterOperatorOption) => {
    setEquipmentState((prev) => ({
      ...prev,
      router: {
        ...prev.router,
        operator: operator,
      },
    }));
  };

  const handleRouterConfigSelect = (config: RouterConfigOption) => {
    setEquipmentState((prev) => ({
      ...prev,
      router: {
        ...prev.router,
        config: config,
      },
    }));
  };

  const handleTvBoxNeedSelect = (option: TvBoxNeedOption) => {
    setEquipmentState((prev) => ({
      ...prev,
      tvBox: { ...prev.tvBox!, need: option },
    }));
  };

  const handleTvBoxTvCountSelect = (count: TvCountOption) => {
    setEquipmentState((prev) => ({
      ...prev,
      tvBox: { ...prev.tvBox!, tvCount: count },
    }));
  };

  const handleTvBoxPurchaseSelect = (option: TvBoxPurchaseOption) => {
    setEquipmentState((prev) => ({
      ...prev,
      tvBox: { ...prev.tvBox!, purchaseOption: option },
    }));
  };

  const handleTvBoxOperatorSelect = (operator: TvBoxOperatorOption) => {
    setEquipmentState((prev) => ({
      ...prev,
      tvBox: { ...prev.tvBox!, operatorId: operator },
    }));
  };

  // SIM Card handlers
  const handleSimConnectionTypeSelect = (option: SimConnectionType) => {
    setEquipmentState((prev) => ({
      ...prev,
      simCard: { ...prev.simCard!, connectionType: option },
    }));
  };

  const handleSimClientStatusSelect = (option: SimClientStatus) => {
    setEquipmentState((prev) => ({
      ...prev,
      simCard: { ...prev.simCard!, clientStatus: option },
    }));
  };

  const handleSimSmartphoneCountSelect = (count: SimSmartphoneCount) => {
    setEquipmentState((prev) => ({
      ...prev,
      simCard: { ...prev.simCard!, smartphoneCount: count },
    }));
    // Показать баннер если выбрано больше 1 смартфона
    if (count > 1) {
      setShowSimCountWarning(true);
    }
  };

  const handleSimOperatorSelect = (operator: SimOperatorOption) => {
    setEquipmentState((prev) => ({
      ...prev,
      simCard: { ...prev.simCard!, currentOperator: operator },
    }));
  };

  const handleConsultationClose = () => setShowConsultation(false);
  const handleConsultationSubmit = async (_data: { phone?: string; method?: string }) => {
    setShowConsultation(false);
  };
  const handleConsultationSkip = async () => setShowConsultation(false);

  const handleNext = () => {
    if (currentStep === 'router_need') {
      const { need } = equipmentState.router;

      if (need === 'need') {
        setCurrentStep('router_purchase');
      } else if (need === 'from_operator') {
        setCurrentStep('router_operator');
      } else if (need === 'own') {
        setCurrentStep('router_config');
      } else {
        // no_thanks — переходим к ТВ (если в тарифе есть), иначе к SIM или на итог
        if (returnToOrderSummaryAfter === 'router') {
          goToOrderSummary();
        } else if (hasTV) {
          setCurrentStep('tvbox_need');
        } else if (hasMobile) {
          setCurrentStep('sim_connection_type');
        } else {
          goToOrderSummary();
        }
      }
    } else if (currentStep === 'router_purchase') {
      if (returnToOrderSummaryAfter === 'router') {
        goToOrderSummary();
      } else if (hasTV) {
        setCurrentStep('tvbox_need');
      } else if (hasMobile) {
        setCurrentStep('sim_connection_type');
      } else {
        goToOrderSummary();
      }
    } else if (currentStep === 'router_operator') {
      if (returnToOrderSummaryAfter === 'router') {
        goToOrderSummary();
      } else if (hasTV) {
        setCurrentStep('tvbox_need');
      } else if (hasMobile) {
        setCurrentStep('sim_connection_type');
      } else {
        goToOrderSummary();
      }
    } else if (currentStep === 'router_config') {
      if (returnToOrderSummaryAfter === 'router') {
        goToOrderSummary();
      } else if (hasTV) {
        setCurrentStep('tvbox_need');
      } else if (hasMobile) {
        setCurrentStep('sim_connection_type');
      } else {
        goToOrderSummary();
      }
    } else if (currentStep === 'tvbox_need') {
      const need = equipmentState.tvBox?.need;

      if (need === 'need') {
        setCurrentStep('tvbox_purchase');
      } else if (need === 'have_from_operator') {
        setCurrentStep('tvbox_operator');
      } else {
        if (returnToOrderSummaryAfter === 'tvbox') {
          goToOrderSummary();
        } else if (hasMobile) {
          setCurrentStep('sim_connection_type');
        } else {
          goToOrderSummary();
        }
      }
    } else if (currentStep === 'tvbox_purchase') {
      setCurrentStep('tvbox_tvcount');
    } else if (currentStep === 'tvbox_tvcount') {
      if (returnToOrderSummaryAfter === 'tvbox') {
        goToOrderSummary();
      } else if (hasMobile) {
        setCurrentStep('sim_connection_type');
      } else {
        goToOrderSummary();
      }
    } else if (currentStep === 'tvbox_operator') {
      if (returnToOrderSummaryAfter === 'tvbox') {
        goToOrderSummary();
      } else if (hasMobile) {
        setCurrentStep('sim_connection_type');
      } else {
        goToOrderSummary();
      }
    } else if (currentStep === 'sim_connection_type') {
      const connectionType = equipmentState.simCard?.connectionType;

      if (connectionType === 'keep_number') {
        setCurrentStep('sim_client_status');
      } else if (connectionType === 'new_number') {
        goToOrderSummary();
      }
    } else if (currentStep === 'sim_client_status') {
      // После выбора статуса клиента показываем информационный экран о регистрации на человека
      setCurrentStep('sim_info_person');
    } else if (currentStep === 'sim_info_person') {
      // Для обоих вариантов («клиент» и «не клиент») — после первого инфо идём на второй (регион), затем к количеству смартфонов
      setCurrentStep('sim_info_region');
    } else if (currentStep === 'sim_info_region') {
      goToOrderSummary();
    } else if (currentStep === 'sim_smartphone_count') {
      goToOrderSummary();
    } else if (currentStep === 'order_summary') {
      saveEquipment(equipmentState);
      setShowLoadingToOrder(true);
      router.push('/order');
    } else if (currentStep === 'sim_operator') {
      goToOrderSummary();
    }
  };

  const handleBack = () => {
    if (currentStep === 'router_need') {
      if (returnToOrderSummaryAfter === 'router') {
        goToOrderSummary();
      } else {
        router.push('/providers');
      }
    } else if (currentStep === 'router_purchase') {
      setCurrentStep('router_need');
    } else if (currentStep === 'router_operator') {
      setCurrentStep('router_need');
    } else if (currentStep === 'router_config') {
      if (equipmentState.router.need === 'from_operator') {
        setCurrentStep('router_operator');
      } else {
        setCurrentStep('router_need');
      }
    } else if (currentStep === 'tvbox_need') {
      if (returnToOrderSummaryAfter === 'tvbox') {
        goToOrderSummary();
      } else if (equipmentState.router.need === 'need') {
        setCurrentStep('router_purchase');
      } else if (equipmentState.router.need === 'from_operator') {
        setCurrentStep('router_operator');
      } else if (equipmentState.router.need === 'own') {
        setCurrentStep('router_config');
      } else {
        setCurrentStep('router_need');
      }
    } else if (currentStep === 'tvbox_purchase') {
      setCurrentStep('tvbox_need');
    } else if (currentStep === 'tvbox_tvcount') {
      setCurrentStep('tvbox_purchase');
    } else if (currentStep === 'tvbox_operator') {
      if (equipmentState.tvBox?.need === 'have_from_operator') {
        setCurrentStep('tvbox_need');
      } else {
        setCurrentStep('tvbox_tvcount');
      }
    } else if (currentStep === 'sim_connection_type') {
      if (returnToOrderSummaryAfter === 'sim') {
        goToOrderSummary();
      } else if (returnToOrderSummaryAfter === 'tvbox') {
        goToOrderSummary();
      } else if (hasTV) {
        const tvNeed = equipmentState.tvBox?.need;
        if (tvNeed === 'need') {
          setCurrentStep('tvbox_tvcount');
        } else if (tvNeed === 'have_from_operator') {
          setCurrentStep('tvbox_operator');
        } else {
          setCurrentStep('tvbox_need');
        }
      } else {
        if (equipmentState.router.need === 'need') {
          setCurrentStep('router_purchase');
        } else if (equipmentState.router.need === 'from_operator') {
          setCurrentStep('router_operator');
        } else if (equipmentState.router.need === 'own') {
          setCurrentStep('router_config');
        } else {
          setCurrentStep('router_need');
        }
      }
    } else if (currentStep === 'sim_client_status') {
      setCurrentStep('sim_connection_type');
    } else if (currentStep === 'sim_info_person') {
      setCurrentStep('sim_client_status');
    } else if (currentStep === 'sim_info_region') {
      setCurrentStep('sim_info_person');
    } else if (currentStep === 'sim_smartphone_count') {
      const connectionType = equipmentState.simCard?.connectionType;
      if (connectionType === 'keep_number') {
        setCurrentStep(equipmentState.simCard?.clientStatus === 'new_client' ? 'sim_info_person' : 'sim_info_region');
      } else {
        setCurrentStep('sim_connection_type');
      }
    } else if (currentStep === 'order_summary') {
      // Возврат на тот шаг, с которого пришли на итоговую карточку (последовательно, без лишних модалок)
      if (lastStepBeforeOrderSummary) {
        setCurrentStep(lastStepBeforeOrderSummary);
        setLastStepBeforeOrderSummary(null);
      } else {
        setCurrentStep('router_need');
      }
    } else if (currentStep === 'sim_operator') {
      setCurrentStep('sim_smartphone_count');
    }
  };

  const handleBackdropClick = () => {
    // На итоговой карточке клик по пустоте не перекидывает на другие страницы
    if (currentStep === 'order_summary') return;
    router.push('/providers');
  };

  // Анимация: подсказка появляется после монтирования; скрыта во время уведомления или модалки, потом снова появляется
  const [isHintVisible, setIsHintVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setIsHintVisible(true), 50);
    return () => clearTimeout(t);
  }, []);
  const isPopupOrNotificationOpen = Boolean(frameNotification) || showConsultation;
  const showHintText = isHintVisible && !isPopupOrNotificationOpen;

  return (
    <div
      className="relative w-full max-w-[400px] mx-auto flex flex-col overflow-hidden bg-[#FFFFFF] frame-container"
      style={{
        minHeight: '100dvh',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'var(--sab, 0px)',
        boxSizing: 'border-box',
      }}
    >
      {/* Область с серым фоном — flex: подсказка и карточка влезают в экран, прокрутка только внутри карточки */}
      <div
        className="flex flex-col flex-1 min-h-0 w-full overflow-hidden"
        onClick={handleBackdropClick}
        style={{ background: '#F5F5F5' }}
      >
        {/* Header только на последней странице — высота по контенту (50+41px), затем 15px до карточки */}
        {currentStep === 'order_summary' && (
          <div
            className="flex-shrink-0 relative"
            style={{
              minHeight: 'calc(var(--header-top, 50px) + 41px)',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                top: 'var(--header-top, 50px)',
                marginLeft: '20px',
                marginRight: '20px',
                height: '41px',
              }}
            >
              {/* Кнопка домой — как во Frame1 */}
              <button
                type="button"
                onClick={() => router.push('/')}
                className="outline-none cursor-pointer border-0 w-10 h-10 flex items-center justify-center rounded-full bg-white"
                style={{
                  position: 'absolute',
                  left: '0',
                  top: '0',
                }}
                aria-label="На главную"
              >
                <HomeIcon color="#101010" />
              </button>

              {/* Логотип ГИГАПОИСК — как в Frame1 (Logo): ближе к иконке дома, left 70px от края контента = 50px от кнопки (40px + 10px) */}
              <div
                style={{
                  position: 'absolute',
                  left: '50px',
                  top: '15px',
                  width: '140px',
                  height: '10px',
                }}
                role="img"
                aria-label="Гигапоиск"
              >
                <svg width="140" height="10" viewBox="0 0 230 14" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                  <path d="M0 13.8056V0.194444H22.5306V4.86111H5.93306V13.8056H0ZM49.0092 0.194444V13.8056H43.0761V6.02778L29.9708 13.8056H24.0377V0.194444H29.9708V7.97222L43.0761 0.194444H49.0092ZM50.5142 13.8056V0.194444H73.0448V4.86111H56.4473V13.8056H50.5142ZM84.0292 4.47222L81.288 7.97222H86.7705L84.0292 4.47222ZM80.6872 0.194444H87.3713L98.017 13.8056H91.3329L89.8121 11.8611H78.2464L76.7256 13.8056H70.0415L80.6872 0.194444ZM98.7731 13.8056V0.194444H123.744V13.8056H117.811V4.86111H104.706V13.8056H98.7731ZM131.454 0H145.16C148.784 0 151.732 3.24722 151.732 7C151.732 10.7528 148.784 14 145.16 14H131.454C127.831 14 124.883 10.7528 124.883 7C124.883 3.24722 127.831 0 131.454 0ZM143.94 5.05556H132.675C131.642 5.05556 130.797 5.93056 130.797 7C130.797 8.06944 131.642 8.94444 132.675 8.94444H143.94C144.973 8.94444 145.818 8.06944 145.818 7C145.818 5.93056 144.973 5.05556 143.94 5.05556ZM177.834 0.194444V13.8056H171.901V6.02778L158.796 13.8056H152.863V0.194444H158.796V7.97222L171.901 0.194444H177.834ZM203.38 8.75V13.8056H185.544C181.92 13.8056 178.972 10.7528 178.972 7C178.972 3.24722 181.92 0.194444 185.544 0.194444H203.38V5.25H186.764C185.732 5.25 184.887 5.93056 184.887 7C184.887 8.06944 185.732 8.75 186.764 8.75H203.38ZM204.88 13.8056V0.194444H210.813V7.66111L221.252 0.194444H229.852L220.332 7L229.852 13.8056H221.252L216.033 10.0722L210.813 13.8056H204.88Z" fill="#101010" />
                </svg>
              </div>

              {/* Кнопка консультации */}
              <button
                type="button"
                onClick={() => router.push('/?consultation=1')}
                className="outline-none cursor-pointer border-0 w-10 h-10 flex items-center justify-center rounded-full bg-white"
                style={{
                  position: 'absolute',
                  right: '0',
                  top: '0',
                }}
                aria-label="Консультация"
              >
                <PlaneIcon color="#101010" />
              </button>
            </div>
          </div>
        )}

        {/* Зона подсказки и уведомлений: уведомления с отступом сверху по --header-top (как в Frame1, 2, 5) */}
        {currentStep !== 'order_summary' && (
          <div className="flex-shrink-0 relative" style={{ minHeight: '105px' }}>
            {/* Уведомление — белая карточка по --header-top, единый стиль для всех фреймов */}
            {frameNotification && (
              <div
                className="absolute left-1/2 -translate-x-1/2 bg-white rounded-[20px] flex flex-col"
                style={{
                  width: 'min(360px, calc(100vw - 40px))',
                  top: 'var(--header-top, 50px)',
                  boxSizing: 'border-box',
                  backdropFilter: 'blur(7.5px)',
                  zIndex: 10,
                  padding: '15px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Строка: «Автоматически закроется через» слева, крестик закрытия справа */}
                <div
                  className="flex items-center justify-between flex-shrink-0"
                  style={{ minHeight: '20px' }}
                >
                  <span
                    className="font-normal"
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontSize: '14px',
                      lineHeight: '145%',
                      color: 'rgba(16, 16, 16, 0.25)',
                    }}
                  >
                    Автоматически закроется через {frameNotification.countdown}
                  </span>
                  <button
                    type="button"
                    onClick={closeFrameNotification}
                    className="flex items-center justify-center w-6 h-6 cursor-pointer border-0 p-0 bg-transparent flex-shrink-0"
                    aria-label="Закрыть"
                  >
                    <CloseIcon width={16} height={16} />
                  </button>
                </div>
                {/* Основной текст: по размеру контента */}
                <div
                  className="font-normal"
                  style={{
                    width: '100%',
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '14px',
                    lineHeight: '105%',
                    color: '#101010',
                    marginTop: '8px',
                    wordBreak: 'break-word',
                  }}
                >
                  {frameNotification.type === 'router_operator' || frameNotification.type === 'tvbox_operator'
                    ? 'Внимание, оборудование этого провайдера технически прошито только на свои сети. Поэтому, подключить его невозможно. '
                    : frameNotification.type === 'tvbox_tvcount'
                      ? 'К сожалению, стоимость подключения, а также стоимость ежемесячного платежа увеличится, пропорционально вашему числу телевизоров. Если же их число, свыше одного устройства. '
                      : frameNotification.type === 'tvbox_own'
                        ? 'К сожалению, стороннее устройство невозможно подключить к сети оператора. Поэтому, вы можете его самостоятельно переставить на дополнительное устройство, например, телевизор или же монитор. '
                        : 'К сожалению, стоимость подключения, а также стоимость ежемесячного платежа увеличится, пропорционально вашему числу смартфонов. Если же их число, свыше одного устройства. '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#007AFF] underline" onClick={(e) => e.stopPropagation()}>
                    Подробнее об этом писали в медиа
                  </a>
                </div>
              </div>
            )}

            {/* Подсказка — фиксированно сверху */}
            <div
              className="flex justify-center"
              style={{
                margin: '0 auto',
                paddingTop: HINT_TOP,
                opacity: showHintText ? 1 : 0,
                transform: showHintText ? 'translateY(0)' : 'translateY(-6px)',
                transition: 'opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <ClickOutsideHintContent />
            </div>
          </div>
        )}

        {/* Белая карточка — занимает остаток экрана, контент шага прокручивается внутри. Клик по пустоте (вне карточки) закрывает. */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col rounded-[20px] bg-white overflow-hidden"
            style={{
              width: '360px',
              maxWidth: '360px',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: currentStep === 'order_summary' ? 'auto' : undefined,
              marginBottom: currentStep === 'order_summary'
                ? 'calc(20px + env(safe-area-inset-bottom, 0px))'
                : 'calc(20px + env(safe-area-inset-bottom, 0px))',
              backdropFilter: 'blur(7.5px)',
              // Итоговая карточка: высота по контенту, прижата к низу (marginTop: auto), отступ от низа экрана 20px
              ...(currentStep === 'order_summary'
                ? {}
                : { marginTop: 'auto', maxHeight: 'calc(100dvh - 145px)' }),
            }}
          >
            {/* Контент шага. Итоговая карточка (order_summary) — без скролла, всё вмещается за счёт адаптивных отступов */}
            <div
              key={currentStep}
              className={`flex flex-col w-full flex-1 min-h-0 ${currentStep === 'order_summary' ? 'overflow-hidden' : 'overflow-y-auto'}`}
              style={{
                animation: 'frame4StepIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              }}
            >
            {currentStep === 'router_need' && (
              <RouterNeedStep
                selected={equipmentState.router.need}
                onSelect={handleRouterNeedSelect}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'router_purchase' && (
              <RouterPurchaseStep
                selected={equipmentState.router.purchase || null}
                onSelect={handleRouterPurchaseSelect}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'router_operator' && (
              <RouterOperatorStep
                selected={equipmentState.router.operator || null}
                onSelect={handleRouterOperatorSelect}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'router_config' && (
              <RouterConfigStep
                selected={equipmentState.router.config || null}
                onSelect={handleRouterConfigSelect}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'tvbox_need' && (
              <TvBoxNeedStep
                selected={equipmentState.tvBox?.need ?? null}
                onSelect={handleTvBoxNeedSelect}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'tvbox_tvcount' && (
              <TvBoxTvCountStep
                selected={equipmentState.tvBox?.tvCount ?? null}
                onSelect={handleTvBoxTvCountSelect}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'tvbox_purchase' && (
              <TvBoxPurchaseStep
                selected={equipmentState.tvBox?.purchaseOption ?? null}
                onSelect={handleTvBoxPurchaseSelect}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'tvbox_operator' && (
              <TvBoxOperatorStep
                selected={equipmentState.tvBox?.operatorId ?? null}
                onSelect={handleTvBoxOperatorSelect}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'sim_connection_type' && (
              <SimConnectionTypeStep
                selected={equipmentState.simCard?.connectionType ?? null}
                onSelect={handleSimConnectionTypeSelect}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'sim_client_status' && (
              <SimClientStatusStep
                selected={equipmentState.simCard?.clientStatus ?? null}
                onSelect={handleSimClientStatusSelect}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'sim_info_person' && (
              <SimInfoStep
                infoType="person"
                showBothWarningsWithDelay={equipmentState.simCard?.clientStatus === 'new_client'}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'sim_info_region' && (
              <SimInfoStep
                infoType="region"
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'sim_smartphone_count' && (
              <SimSmartphoneCountStep
                selected={equipmentState.simCard?.smartphoneCount ?? null}
                onSelect={handleSimSmartphoneCountSelect}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'sim_operator' && (
              <SimOperatorStep
                selected={equipmentState.simCard?.currentOperator ?? null}
                onSelect={handleSimOperatorSelect}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'order_summary' && (
              <OrderSummaryStep
                equipmentState={equipmentState}
                onConnect={() => {
                  saveEquipment(equipmentState);
                  setShowLoadingToOrder(true);
                  router.push('/order');
                }}
                onBack={handleBack}
                onGoToRouterStep={() => {
                  setEquipmentState((prev) => ({
                    ...prev,
                    router: { ...prev.router, need: 'need', purchase: 'rent' },
                  }));
                  setReturnToOrderSummaryAfter('router');
                  setCurrentStep('router_need');
                }}
                onGoToSimStep={() => {
                  setEquipmentState((prev) => ({
                    ...prev,
                    simCard: { ...prev.simCard!, connectionType: 'keep_number', smartphoneCount: 1 },
                  }));
                  setReturnToOrderSummaryAfter('sim');
                  setCurrentStep('sim_connection_type');
                }}
                onGoToTvBoxStep={() => {
                  setEquipmentState((prev) => ({
                    ...prev,
                    tvBox: { ...prev.tvBox!, need: 'need', tvCount: 1 },
                  }));
                  setReturnToOrderSummaryAfter('tvbox');
                  setCurrentStep('tvbox_need');
                }}
                callbacks={{
                  onRouterNeedChange: handleRouterNeedSelect,
                  onRouterPurchaseChange: handleRouterPurchaseSelect,
                  onTvBoxNeedChange: handleTvBoxNeedSelect,
                  onTvBoxCountChange: handleTvBoxTvCountSelect,
                  onSimCountChange: handleSimSmartphoneCountSelect,
                  onSimConnectionTypeChange: handleSimConnectionTypeSelect,
                }}
              />
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Экран загрузки при переходе с 4 на 5 фрейм */}
      {showLoadingToOrder && <LoadingScreen />}

      {/* Модалка консультации — доступна на всех шагах, в т.ч. на итоговом тарифе */}
      {showConsultation && (
        <ConsultationFlow
          onClose={handleConsultationClose}
          onSubmit={handleConsultationSubmit}
          onSkip={handleConsultationSkip}
        />
      )}
    </div>
  );
}

export default function Frame4() {
  return (
    <AddressProvider>
      <Frame4Content />
    </AddressProvider>
  );
}
