'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from './steps';
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
  | 'sim_smartphone_count'
  | 'sim_operator';

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
  sim_connection_type: { height: 350, top: 375 },
  sim_client_status: { height: 295, top: 430 },
  sim_smartphone_count: { height: 460, top: 265 },
  sim_operator: { height: 460, top: 265 },
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
  };

  const handleSimOperatorSelect = (operator: SimOperatorOption) => {
    setEquipmentState((prev) => ({
      ...prev,
      simCard: { ...prev.simCard!, currentOperator: operator },
    }));
  };

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

      if (connectionType === 'no_thanks') {
        // Пропускаем SIM карту, идём на заказ
        saveEquipment(equipmentState);
        router.push('/order');
      } else if (connectionType === 'new_number') {
        // Новый номер — спрашиваем количество
        setCurrentStep('sim_smartphone_count');
      } else if (connectionType === 'keep_number') {
        // Сохранить номер — спрашиваем статус клиента
        setCurrentStep('sim_client_status');
      }
    } else if (currentStep === 'sim_client_status') {
      setCurrentStep('sim_smartphone_count');
    } else if (currentStep === 'sim_smartphone_count') {
      const connectionType = equipmentState.simCard?.connectionType;
      if (connectionType === 'keep_number') {
        // Если сохраняем номер, спрашиваем оператора
        setCurrentStep('sim_operator');
      } else {
        // Если новый номер, идём на заказ
        saveEquipment(equipmentState);
        router.push('/order');
      }
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
    } else if (currentStep === 'sim_smartphone_count') {
      const connectionType = equipmentState.simCard?.connectionType;
      if (connectionType === 'keep_number') {
        setCurrentStep('sim_client_status');
      } else {
        setCurrentStep('sim_connection_type');
      }
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
