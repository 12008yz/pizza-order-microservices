'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CaretRight, X } from '@phosphor-icons/react';
import { AddressProvider, useAddress, ConnectionType } from '../../../contexts/AddressContext';
import ConnectionTypeModal from '../../modals/ConnectionTypeModal';
import AddressInputModal from '../../modals/AddressInputModal';
import PrivacyConsent from './PrivacyConsent';
import Header from '../../layout/Header';
import LoadingScreen from '../../LoadingScreen';
import AnimatedCheck from '../../common/AnimatedCheck';
import dynamic from 'next/dynamic';

const ConsultationFlow = dynamic(() => import('../Frame2/ConsultationFlow'), {
  loading: () => <div>Загрузка...</div>,
  ssr: false,
});

type FlowState = 'form' | 'loading' | 'consultation';
type ContactMethod = 'max' | 'telegram' | 'phone';

function AddressFormContent() {
  const router = useRouter();
  const { addressData, validateForm, clearErrors, clearAddress } = useAddress();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressModalStep, setAddressModalStep] = useState<'city' | 'street' | 'house'>('city');
  const [_submitError, setSubmitError] = useState<string | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [cookieTimer, setCookieTimer] = useState(7);

  const [flowState, setFlowState] = useState<FlowState>('form');
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [isSubmitPressed, setIsSubmitPressed] = useState(false);

  useEffect(() => {
    if (showCookieBanner && cookieTimer > 0) {
      let timerId: NodeJS.Timeout | null = null;

      timerId = setInterval(() => {
        setCookieTimer((prev) => {
          if (prev <= 1) {
            setShowCookieBanner(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerId) clearInterval(timerId);
      };
    }
  }, [showCookieBanner, cookieTimer]);

  useEffect(() => {
    if (flowState === 'loading') {
      let intervalId: NodeJS.Timeout | null = null;

      intervalId = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            if (intervalId) clearInterval(intervalId);
            setFlowState('consultation');
            return 100;
          }
          return prev + 5;
        });
      }, 30);

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
  }, [flowState]);

  const getConnectionTypeLabel = (type: ConnectionType): string => {
    switch (type) {
      case 'apartment':
        return 'Подключение квартиры';
      case 'private':
        return 'Подключение частного сектора';
      case 'office':
        return 'Подключение офиса';
      default:
        return 'Подключение';
    }
  };

  const activeStep =
    !addressData.connectionType ? 0
    : !addressData.city ? 1
    : !addressData.street ? 2
    : !addressData.houseNumber ? 3
    : 3;

  const isFieldActive = (step: number) => step === activeStep;

  const handleConnectionTypeClick = () => {
    setShowConnectionModal(true);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    clearErrors();

    if (!validateForm()) {
      return;
    }

    setLoadingProgress(0);
    setFlowState('loading');
  };

  const handleConsultationClose = () => {
    clearErrors();
    if (!validateForm()) {
      setFlowState('form');
      clearErrors();
      return;
    }

    try {
      const sanitizedAddressData = {
        ...addressData,
        city: sanitizeString(addressData.city, 100),
        street: sanitizeString(addressData.street, 200),
        houseNumber: sanitizeString(addressData.houseNumber, 20),
        apartmentNumber: sanitizeString(addressData.apartmentNumber, 20),
      };
      sessionStorage.setItem('addressData', JSON.stringify(sanitizedAddressData));
      sessionStorage.removeItem('addressFormData');
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error);
    }

    clearAddress();
    router.push('/providers');
  };

  const handleHeaderConsultationClick = () => {
    setLoadingProgress(0);
    setFlowState('loading');
  };

  const sanitizeString = (str: string | undefined, maxLength: number = 200): string | undefined => {
    if (!str) return undefined;
    const sanitized = str
      .trim()
      .replace(/[<>"']/g, '')
      .slice(0, maxLength);
    return sanitized || undefined;
  };

  const savePhoneToDatabase = async (phone: string, method?: ContactMethod) => {
    if (!phone) return;

    const normalizedPhone = phone.replace(/\D/g, '');

    if (normalizedPhone.length !== 11) {
      console.error('Invalid phone number format');
      return;
    }

    const userData = {
      phone: normalizedPhone,
      city: sanitizeString(addressData.city, 100),
      street: sanitizeString(addressData.street, 200),
      house: sanitizeString(addressData.houseNumber, 20),
      apartment: sanitizeString(addressData.apartmentNumber, 20) || undefined,
      connectionType: addressData.connectionType || undefined,
      contactMethod: method || undefined,
    };

    try {
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        console.error('Failed to save user data:', await response.text());
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const saveUserDataAndNavigate = async (phone?: string, method?: ContactMethod) => {
    try {
      clearErrors();
      if (!validateForm()) {
        setFlowState('form');
        clearErrors();
        return;
      }

      if (phone) {
        await savePhoneToDatabase(phone, method);
      }

      const sanitizedAddressData = {
        ...addressData,
        city: sanitizeString(addressData.city, 100),
        street: sanitizeString(addressData.street, 200),
        houseNumber: sanitizeString(addressData.houseNumber, 20),
        apartmentNumber: sanitizeString(addressData.apartmentNumber, 20),
      };

      try {
        sessionStorage.setItem('addressData', JSON.stringify(sanitizedAddressData));
        sessionStorage.removeItem('addressFormData');
      } catch (error) {
        console.warn('Failed to save to sessionStorage:', error);
      }

      clearAddress();
      router.push('/providers');
    } catch (error) {
      console.error('Error in saveUserDataAndNavigate:', error);
      setFlowState('form');
    }
  };

  const handleConsultationSubmit = async (data: { phone?: string; method?: ContactMethod }) => {
    await saveUserDataAndNavigate(data.phone, data.method);
  };

  const handleConsultationSkip = async () => {
    await saveUserDataAndNavigate();
  };

  if (flowState === 'loading') {
    return <LoadingScreen progress={loadingProgress} />;
  }

  if (flowState === 'consultation') {
    return (
      <ConsultationFlow
        onClose={handleConsultationClose}
        onSubmit={handleConsultationSubmit}
        onSkip={handleConsultationSkip}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center bg-[#F5F5F5] overflow-hidden"
      style={{
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Контейнер 400px — строго по макету Figma, без масштабирования */}
      <div
        className="relative w-full max-w-[400px] flex flex-col bg-[#F5F5F5] h-full overflow-hidden"
        style={{ minHeight: 0, paddingBottom: '20px', boxSizing: 'border-box' }}
      >
        {/* Хедер: иконки 75px сверху, лого 90px */}
        <div
          className="flex-shrink-0 relative"
          style={{ minHeight: '115px' }}
        >
          {!showCookieBanner && (
            <Header onConsultationClick={handleHeaderConsultationClick} />
          )}
        </div>

        {/* Cookie Banner - абсолютно позиционирован поверх */}
        {showCookieBanner && (
          <div
            className="absolute bg-white z-20"
          style={{
            left: '20px',
            right: '20px',
            top: '100px',
            borderRadius: '20px',
              padding: '15px',
            }}
          >
            {/* Текст таймера */}
            <div
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '14px',
                lineHeight: '145%',
                color: 'rgba(16, 16, 16, 0.25)',
                marginBottom: '10px',
              }}
            >
              Автоматически закроется через {cookieTimer}
            </div>

            {/* Основной текст */}
            <div
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '14px',
                lineHeight: '105%',
                color: '#101010',
                paddingRight: '20px',
              }}
            >
              Если продолжаете использовать этот портал, вы выражаете согласие на использование
              файлов куки в соответствии с условиями{' '}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                политики конфиденциальности
              </a>
              {' '}портала
            </div>

            {/* Кнопка закрытия (X) */}
            <button
              onClick={() => setShowCookieBanner(false)}
              className="absolute cursor-pointer flex items-center justify-center bg-transparent border-none outline-none"
              style={{
                width: '16px',
                height: '16px',
                right: '15px',
                top: '15px',
              }}
            >
              <X size={16} weight="regular" color="rgba(16, 16, 16, 0.25)" />
            </button>
          </div>
        )}

        {/* Белая карточка: отступы по бокам 20px, сверху по макету, снизу 20px от браузерной строки */}
        <div
          className="bg-white flex flex-col flex-shrink-0"
          style={{
            marginLeft: '20px',
            marginRight: '20px',
            marginTop: '230px',
            marginBottom: '20px',
            width: '360px',
            maxWidth: 'calc(100% - 40px)',
            borderRadius: '20px',
            padding: '15px',
            boxSizing: 'border-box',
          }}
        >
          {/* Заголовок: 20px, line-height 125%, отступ до полей 20px */}
          <h1
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '125%',
              color: '#101010',
              margin: 0,
              marginBottom: '20px',
              flexShrink: 0,
            }}
          >
            Маркетплейс тарифных планов операторов на твоём адресе. Бесплатно и легко заказать
          </h1>

          {/* Контейнер полей: gap 5px, ширина 330px (35+330+35=400) */}
          <div className="flex flex-col flex-shrink-0" style={{ gap: '5px' }}>
            {/* Поле Подключение: высота 50px, отступ текста слева 15px, стрелка справа 16px */}
            <div
              className="w-full rounded-[10px] bg-white cursor-pointer flex items-center justify-between flex-shrink-0"
              style={{
                height: '50px',
                paddingLeft: '15px',
                paddingRight: '16px',
                boxSizing: 'border-box',
                minHeight: '50px',
                border: addressData.errors.connectionType
                  ? '1px solid rgb(239, 68, 68)'
                  : isFieldActive(0) || addressData.connectionType
                    ? '1px solid rgba(16, 16, 16, 0.5)'
                    : '1px solid rgba(16, 16, 16, 0.25)',
              }}
              onClick={handleConnectionTypeClick}
            >
              <span
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '16px',
                  lineHeight: '125%',
                  color: addressData.connectionType ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  marginRight: '8px',
                }}
              >
                {addressData.connectionType
                  ? getConnectionTypeLabel(addressData.connectionType)
                  : 'Подключение'}
              </span>
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: addressData.errors.connectionType
                    ? 'rgb(239, 68, 68)'
                    : addressData.connectionType
                      ? '#9CA3AF'
                      : isFieldActive(0)
                        ? '#101010'
                        : 'transparent',
                  border: addressData.errors.connectionType || addressData.connectionType || isFieldActive(0)
                    ? 'none'
                    : '1px solid rgba(16, 16, 16, 0.5)',
                }}
              >
                {addressData.connectionType ? (
                  <AnimatedCheck key={`connection-${addressData.connectionType}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
                ) : (
                  <CaretRight size={16} weight="regular" color={addressData.errors.connectionType || isFieldActive(0) ? "#FFFFFF" : "rgba(16, 16, 16, 0.5)"} />
                )}
              </div>
            </div>

            {/* Поле Населённый пункт */}
            <div
              className={`w-full rounded-[10px] bg-white flex items-center justify-between flex-shrink-0 ${!addressData.connectionType ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                height: '50px',
                minHeight: '50px',
                paddingLeft: '15px',
                paddingRight: '16px',
                boxSizing: 'border-box',
                opacity: !addressData.connectionType ? 0.5 : 1,
                border: addressData.errors.city
                  ? '1px solid rgb(239, 68, 68)'
                  : isFieldActive(1) || addressData.city
                    ? '1px solid rgba(16, 16, 16, 0.5)'
                    : '1px solid rgba(16, 16, 16, 0.25)',
              }}
              onClick={() => {
                if (!addressData.connectionType) return;
                setAddressModalStep('city');
                setShowAddressModal(true);
              }}
            >
              <span
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '16px',
                  lineHeight: '125%',
                  color: addressData.city ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  marginRight: '8px',
                }}
              >
                {addressData.city || 'Название населённого пункта'}
              </span>
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: addressData.errors.city
                    ? 'rgb(239, 68, 68)'
                    : addressData.city
                      ? '#9CA3AF'
                      : isFieldActive(1)
                        ? '#101010'
                        : 'transparent',
                  border: addressData.errors.city || addressData.city || isFieldActive(1)
                    ? 'none'
                    : '1px solid rgba(16, 16, 16, 0.5)',
                }}
              >
                {addressData.city ? (
                  <AnimatedCheck key={`city-${addressData.city}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
                ) : (
                  <CaretRight size={16} weight="regular" color={addressData.errors.city || isFieldActive(1) ? "#FFFFFF" : "rgba(16, 16, 16, 0.5)"} />
                )}
              </div>
            </div>

            {/* Поле Улица */}
            <div
              className={`w-full rounded-[10px] bg-white flex items-center justify-between flex-shrink-0 ${!addressData.city ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                height: '50px',
                minHeight: '50px',
                paddingLeft: '15px',
                paddingRight: '16px',
                boxSizing: 'border-box',
                opacity: !addressData.city ? 0.5 : 1,
                border: addressData.errors.street
                  ? '1px solid rgb(239, 68, 68)'
                  : isFieldActive(2) || addressData.street
                    ? '1px solid rgba(16, 16, 16, 0.5)'
                    : '1px solid rgba(16, 16, 16, 0.25)',
              }}
              onClick={() => {
                if (addressData.city) {
                  setAddressModalStep('street');
                  setShowAddressModal(true);
                }
              }}
            >
              <span
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '16px',
                  lineHeight: '125%',
                  color: addressData.street ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  marginRight: '8px',
                }}
              >
                {addressData.street || 'Улица'}
              </span>
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: addressData.errors.street
                    ? 'rgb(239, 68, 68)'
                    : addressData.street
                      ? '#9CA3AF'
                      : isFieldActive(2)
                        ? '#101010'
                        : 'transparent',
                  border: addressData.errors.street || addressData.street || isFieldActive(2)
                    ? 'none'
                    : '1px solid rgba(16, 16, 16, 0.5)',
                }}
              >
                {addressData.street ? (
                  <AnimatedCheck key={`street-${addressData.street}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
                ) : (
                  <CaretRight size={16} weight="regular" color={addressData.errors.street || isFieldActive(2) ? "#FFFFFF" : "rgba(16, 16, 16, 0.5)"} />
                )}
              </div>
            </div>

            {/* Поле Номер дома */}
            <div
              className={`w-full rounded-[10px] bg-white flex items-center justify-between flex-shrink-0 ${!addressData.street ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                height: '50px',
                minHeight: '50px',
                paddingLeft: '15px',
                paddingRight: '16px',
                boxSizing: 'border-box',
                opacity: !addressData.street ? 0.5 : 1,
                border: addressData.errors.houseNumber
                  ? '1px solid rgb(239, 68, 68)'
                  : isFieldActive(3) || addressData.houseNumber
                    ? '1px solid rgba(16, 16, 16, 0.5)'
                    : '1px solid rgba(16, 16, 16, 0.25)',
              }}
              onClick={() => {
                if (addressData.street) {
                  setAddressModalStep('house');
                  setShowAddressModal(true);
                }
              }}
            >
              <span
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '16px',
                  lineHeight: '125%',
                  color: addressData.houseNumber ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  marginRight: '8px',
                }}
              >
                {addressData.houseNumber
                  ? (addressData.apartmentNumber
                    ? `д. ${addressData.houseNumber} кв. ${addressData.apartmentNumber}`
                    : addressData.houseNumber)
                  : 'Номер дома'}
              </span>
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: addressData.errors.houseNumber
                    ? 'rgb(239, 68, 68)'
                    : addressData.houseNumber
                      ? '#9CA3AF'
                      : isFieldActive(3)
                        ? '#101010'
                        : 'transparent',
                  border: addressData.errors.houseNumber || addressData.houseNumber || isFieldActive(3)
                    ? 'none'
                    : '1px solid rgba(16, 16, 16, 0.5)',
                }}
              >
                {addressData.houseNumber ? (
                  <AnimatedCheck key={`house-${addressData.houseNumber}-${addressData.apartmentNumber ?? ''}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
                ) : (
                  <CaretRight size={16} weight="regular" color={addressData.errors.houseNumber || isFieldActive(3) ? "#FFFFFF" : "rgba(16, 16, 16, 0.5)"} />
                )}
              </div>
            </div>

            {/* Чекбокс с политикой: top 67.82% ≈ 590px, gap от полей 5px */}
            <div className="flex-shrink-0" style={{ marginTop: '5px' }}>
              <PrivacyConsent />
            </div>

            {/* Кнопка: top 75.86% ≈ 660px, отступ от чекбокса 20px */}
            <button
              onClick={handleSubmit}
              onMouseDown={() => setIsSubmitPressed(true)}
              onMouseUp={() => setIsSubmitPressed(false)}
              onMouseLeave={() => setIsSubmitPressed(false)}
              onTouchStart={() => setIsSubmitPressed(true)}
              onTouchEnd={() => setIsSubmitPressed(false)}
              className="w-full flex items-center justify-center text-white outline-none cursor-pointer flex-shrink-0"
              style={{
                height: '50px',
                minHeight: '50px',
                background: '#101010',
                borderRadius: '10px',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontWeight: 400,
                fontSize: '16px',
                color: '#FFFFFF',
                transform: isSubmitPressed ? 'scale(0.97)' : 'scale(1)',
                transition: 'transform 0.15s ease-out',
                marginTop: '20px',
              }}
            >
              Показать всех операторов
            </button>
          </div>
        </div>

        <ConnectionTypeModal
          isOpen={showConnectionModal}
          onClose={() => setShowConnectionModal(false)}
          onNext={() => {
            setShowConnectionModal(false);
          }}
        />

        <AddressInputModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onComplete={() => setShowAddressModal(false)}
          initialStep={addressModalStep}
        />
      </div>
    </div>
  );
}

export default function AddressFormPage() {
  return (
    <AddressProvider>
      <AddressFormContent />
    </AddressProvider>
  );
}
