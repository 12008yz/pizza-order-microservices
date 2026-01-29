'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RouterNeedStep, RouterPurchaseStep } from './steps';
import type { RouterNeedOption, RouterPurchaseOption, EquipmentState } from './types';
import { AddressProvider } from '../../../contexts/AddressContext';

// Конфигурация карточек для разных шагов
const cardConfig = {
  router_need: { height: 405, top: 320 },
  router_purchase: { height: 350, top: 375 },
  router_operator: { height: 460, top: 265 },
  router_config: { height: 295, top: 430 },
};

function Frame4Content() {
  const router = useRouter();

  const [equipmentState, setEquipmentState] = useState<EquipmentState>({
    router: {
      need: 'need', // По умолчанию выбрано "Да, мне это необходимо"
      purchase: 'buy', // По умолчанию выбрано "Покупка"
    },
  });

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
        // no_thanks - завершаем flow роутера
        console.log('Router flow completed:', equipmentState);
      }
    } else if (currentStep === 'router_purchase') {
      // Завершаем flow после выбора способа покупки
      console.log('Router flow completed:', equipmentState);
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
      setCurrentStep('router_need');
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
