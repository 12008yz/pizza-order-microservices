'use client';

import { useState, useEffect } from 'react';
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
import { SimCountWarningBanner } from './components';
import { HomeIcon, PlaneIcon } from '../../common/icons';

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

// Конфигурация карточек для разных шагов (высота подстраивается под контент)
const cardConfig: Record<Step, { height: number; top: number }> = {
  router_need: { height: 405, top: 320 },
  router_purchase: { height: 350, top: 375 },
  router_operator: { height: 460, top: 265 },
  router_config: { height: 295, top: 430 },
  tvbox_need: { height: 405, top: 320 },
  // 4 строки опций + заголовок + кнопки — увеличиваем высоту, чтобы всё помещалось
  tvbox_tvcount: { height: 430, top: 315 },
  tvbox_purchase: { height: 350, top: 375 },
  tvbox_operator: { height: 460, top: 265 },
  // SIM card steps
  sim_connection_type: { height: 295, top: 430 },
  sim_client_status: { height: 295, top: 430 },
  sim_info_person: { height: 320, top: 405 },
  sim_info_region: { height: 250, top: 475 },
  sim_smartphone_count: { height: 405, top: 320 },
  sim_operator: { height: 460, top: 265 },
  // Итог: выбранный тариф из Frame3 + оборудование
  order_summary: { height: 580, top: 145 },
};

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

  // Инициализация из сохранённого выбора при монтировании
  useEffect(() => {
    if (savedEquipment) {
      setEquipmentState((prev) => ({
        ...prev,
        ...savedEquipment,
        tvBox: { ...defaultTvBox, ...savedEquipment.tvBox },
        simCard: { ...defaultSimCard, ...savedEquipment.simCard },
      }));
    }
  }, []);

  // Всегда сохраняем выбор в контекст (и в sessionStorage) при изменении
  useEffect(() => {
    saveEquipment(equipmentState);
  }, [equipmentState, saveEquipment]);

  const [currentStep, setCurrentStep] = useState<Step>('router_need');

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
        // no_thanks — переходим к выбору ТВ
        setCurrentStep('tvbox_need');
      }
    } else if (currentStep === 'router_purchase') {
      setCurrentStep('tvbox_need');
    } else if (currentStep === 'router_operator') {
      setCurrentStep('router_config');
    } else if (currentStep === 'router_config') {
      setCurrentStep('tvbox_need');
    } else if (currentStep === 'tvbox_need') {
      const need = equipmentState.tvBox?.need;

      if (need === 'need') {
        setCurrentStep('tvbox_purchase'); // сначала цена (покупка/рассрочка/аренда)
      } else if (need === 'have_from_operator') {
        setCurrentStep('tvbox_operator');
      } else {
        // have_own | smart_tv — переходим к SIM карте
        setCurrentStep('sim_connection_type');
      }
    } else if (currentStep === 'tvbox_purchase') {
      setCurrentStep('tvbox_tvcount'); // после цены — количество
    } else if (currentStep === 'tvbox_tvcount') {
      setCurrentStep('tvbox_operator');
    } else if (currentStep === 'tvbox_operator') {
      // После ТВ-бокса переходим к SIM карте
      setCurrentStep('sim_connection_type');
    } else if (currentStep === 'sim_connection_type') {
      const connectionType = equipmentState.simCard?.connectionType;

      if (connectionType === 'keep_number') {
        // Подключение текущего номера — спрашиваем статус клиента МТС
        setCurrentStep('sim_client_status');
      } else if (connectionType === 'new_number') {
        // Подключение нового номера — переходим к количеству смартфонов
        setCurrentStep('sim_smartphone_count');
      }
    } else if (currentStep === 'sim_client_status') {
      // После выбора статуса клиента показываем информационный экран о регистрации на человека
      setCurrentStep('sim_info_person');
    } else if (currentStep === 'sim_info_person') {
      // Если «Я не являюсь клиентом МТС» — оба предупреждения с таймером показаны, переход на Frame 5 (оформление заказа)
      if (equipmentState.simCard?.clientStatus === 'new_client') {
        saveEquipment(equipmentState);
        router.push('/order');
      } else {
        setCurrentStep('sim_info_region');
      }
    } else if (currentStep === 'sim_info_region') {
      // После второго инфо-экрана переходим к количеству смартфонов
      setCurrentStep('sim_smartphone_count');
    } else if (currentStep === 'sim_smartphone_count') {
      // После выбора количества смартфонов — итоговая карточка: тариф из Frame3 + оборудование
      setCurrentStep('order_summary');
    } else if (currentStep === 'order_summary') {
      saveEquipment(equipmentState);
      router.push('/order');
    } else if (currentStep === 'sim_operator') {
      saveEquipment(equipmentState);
      router.push('/order');
    }
  };

  const handleBack = () => {
    if (currentStep === 'router_need') {
      router.push('/providers');
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
      setCurrentStep('router_config');
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
      // Возврат к ТВ-боксу
      const tvNeed = equipmentState.tvBox?.need;
      if (tvNeed === 'need') {
        setCurrentStep('tvbox_operator');
      } else if (tvNeed === 'have_from_operator') {
        setCurrentStep('tvbox_operator');
      } else {
        setCurrentStep('tvbox_need');
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
      setCurrentStep('sim_smartphone_count');
    } else if (currentStep === 'sim_operator') {
      setCurrentStep('sim_smartphone_count');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      router.push('/providers');
    }
  };

  // Анимация: подсказка появляется после монтирования (как в ConnectionTypeModal)
  const [isHintVisible, setIsHintVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setIsHintVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const currentCardConfig = cardConfig[currentStep];
  const cardTransition = 'height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';

  return (
    <div
      style={{
        position: 'relative',
        width: '400px',
        height: '870px',
        background: '#FFFFFF',
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      {/* Group 7499 */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '745px',
          left: 'calc(50% - 400px/2)',
          top: '0px',
        }}
      >
        {/* ace - серый фон */}
        <div
          onClick={handleBackdropClick}
          style={{
            position: 'absolute',
            left: '0%',
            right: '0%',
            top: '0%',
            bottom: '0%',
            background: '#F5F5F5',
          }}
        >
          {/* Header только на последней странице — итоговый пакет (order_summary) */}
          {currentStep === 'order_summary' && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                width: '360px',
                height: '42px',
                left: '20px',
                top: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <button
                type="button"
                onClick={() => router.push('/')}
                className="outline-none cursor-pointer border-0 w-10 h-10 flex items-center justify-center rounded-full bg-white"
                aria-label="На главную"
              >
                <HomeIcon color="#101010" />
              </button>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                <svg
                  width="143"
                  height="11"
                  viewBox="0 0 230 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    d="M0 13.8056V0.194444H22.5306V4.86111H5.93306V13.8056H0ZM49.0092 0.194444V13.8056H43.0761V6.02778L29.9708 13.8056H24.0377V0.194444H29.9708V7.97222L43.0761 0.194444H49.0092ZM50.5142 13.8056V0.194444H73.0448V4.86111H56.4473V13.8056H50.5142ZM84.0292 4.47222L81.288 7.97222H86.7705L84.0292 4.47222ZM80.6872 0.194444H87.3713L98.017 13.8056H91.3329L89.8121 11.8611H78.2464L76.7256 13.8056H70.0415L80.6872 0.194444ZM98.7731 13.8056V0.194444H123.744V13.8056H117.811V4.86111H104.706V13.8056H98.7731ZM131.454 0H145.16C148.784 0 151.732 3.24722 151.732 7C151.732 10.7528 148.784 14 145.16 14H131.454C127.831 14 124.883 10.7528 124.883 7C124.883 3.24722 127.831 0 131.454 0ZM143.94 5.05556H132.675C131.642 5.05556 130.797 5.93056 130.797 7C130.797 8.06944 131.642 8.94444 132.675 8.94444H143.94C144.973 8.94444 145.818 8.06944 145.818 7C145.818 5.93056 144.973 5.05556 143.94 5.05556ZM177.834 0.194444V13.8056H171.901V6.02778L158.796 13.8056H152.863V0.194444H158.796V7.97222L171.901 0.194444H177.834ZM203.38 8.75V13.8056H185.544C181.92 13.8056 178.972 10.7528 178.972 7C178.972 3.24722 181.92 0.194444 185.544 0.194444H203.38V5.25H186.764C185.732 5.25 184.887 5.93056 184.887 7C184.887 8.06944 185.732 8.75 186.764 8.75H203.38ZM204.88 13.8056V0.194444H210.813V7.66111L221.252 0.194444H229.852L220.332 7L229.852 13.8056H221.252L216.033 10.0722L210.813 13.8056H204.88Z"
                    fill="#101010"
                  />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setShowConsultation(true)}
                className="outline-none cursor-pointer border-0 w-10 h-10 flex items-center justify-center rounded-full bg-white"
                aria-label="Консультация"
              >
                <PlaneIcon color="#101010" />
              </button>
            </div>
          )}

          {/* Баннер с предупреждением о смартфонах */}
          {showSimCountWarning && currentStep === 'sim_smartphone_count' && (
            <SimCountWarningBanner
              onClose={() => setShowSimCountWarning(false)}
              autoCloseAfter={7}
            />
          )}

          {/* Нажмите в открытое пустое место — появление с анимацией */}
          <div
            style={{
              position: 'absolute',
              width: '240px',
              height: '30px',
              left: 'calc(50% - 240px/2)',
              top: '75px',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '105%',
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              justifyContent: 'center',
              color: 'rgba(16, 16, 16, 0.25)',
              opacity: isHintVisible ? 1 : 0,
              transform: isHintVisible ? 'translateY(0)' : 'translateY(-6px)',
              transition: 'opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            Нажмите в открытое пустое место,
            <br />
            чтобы выйти из этого режима
          </div>

          {/* Белая карточка — плавное изменение высоты/позиции при смене шага */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              width: '360px',
              height: `${currentCardConfig.height}px`,
              left: '20px',
              top: `${currentCardConfig.top}px`,
              background: '#FFFFFF',
              borderRadius: '20px',
              transition: cardTransition,
              overflow: 'hidden',
            }}
          >
            {/* Контент шага — лёгкое появление при смене шага (как в Frame3/модалках) */}
            <div
              key={currentStep}
              style={{
                width: '100%',
                height: '100%',
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
                  router.push('/order');
                }}
                onBack={handleBack}
                callbacks={{
                  onRouterNeedChange: handleRouterNeedSelect,
                  onRouterPurchaseChange: handleRouterPurchaseSelect,
                  onTvBoxNeedChange: handleTvBoxNeedSelect,
                  onTvBoxCountChange: handleTvBoxTvCountSelect,
                  onSimCountChange: handleSimSmartphoneCountSelect,
                }}
              />
            )}
            </div>
          </div>
        </div>
      </div>

      {/* image 1 - изображение внизу */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '125px',
          left: '0px',
          top: '745px',
          background: '#F5F5F5',
        }}
      />

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
