'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RouterNeedStep, RouterPurchaseStep, RouterOperatorStep, RouterConfigStep } from './steps';
import type { RouterNeedOption, RouterPurchaseOption, RouterOperatorOption, RouterConfigOption, EquipmentState } from './types';
import { AddressProvider } from '../../../contexts/AddressContext';
import { useEquipment } from '../../../contexts/EquipmentContext';

const defaultEquipmentState: EquipmentState = {
  router: {
    need: 'need',
    purchase: 'buy',
    operator: null,
    config: null,
  },
};

// Конфигурация карточек для разных шагов
const cardConfig = {
  router_need: { height: 405, top: 320 },
  router_purchase: { height: 350, top: 375 },
  router_operator: { height: 460, top: 265 },
  router_config: { height: 295, top: 430 },
};

function Frame4Content() {
  const router = useRouter();
  const { equipmentState: savedEquipment, setEquipmentState: saveEquipment } = useEquipment();

  const [equipmentState, setEquipmentState] = useState<EquipmentState>(
    () => savedEquipment ?? defaultEquipmentState
  );

  // Инициализация из сохранённого выбора при монтировании
  useEffect(() => {
    if (savedEquipment) {
      setEquipmentState(savedEquipment);
    }
  }, []);

  // Всегда сохраняем выбор в контекст (и в sessionStorage) при изменении
  useEffect(() => {
    saveEquipment(equipmentState);
  }, [equipmentState, saveEquipment]);

  const [currentStep, setCurrentStep] = useState<
    'router_need' | 'router_purchase' | 'router_operator' | 'router_config'
  >('router_need');

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
        // no_thanks — сохраняем выбор и переходим к вводу данных (Frame5)
        saveEquipment(equipmentState);
        router.push('/order');
      }
    } else if (currentStep === 'router_purchase') {
      saveEquipment(equipmentState);
      router.push('/order');
    } else if (currentStep === 'router_operator') {
      setCurrentStep('router_config');
    } else if (currentStep === 'router_config') {
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
      // Возвращаемся к нужному шагу в зависимости от выбора
      if (equipmentState.router.need === 'from_operator') {
        setCurrentStep('router_operator');
      } else {
        setCurrentStep('router_need');
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      router.push('/providers');
    }
  };

  const currentCardConfig = cardConfig[currentStep];

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
          {/* Нажмите в открытое пустое место, чтобы выйти из этого режима */}
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
            }}
          >
            Нажмите в открытое пустое место,
            <br />
            чтобы выйти из этого режима
          </div>

          {/* Rectangle 67 - белая карточка */}
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
