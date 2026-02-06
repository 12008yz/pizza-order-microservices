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
      className="fixed inset-0 z-[9999] flex flex-col items-center overflow-hidden"
      style={{
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))',
        background: '#F5F5F5',
      }}
    >
      {/* 400px ширина; высота = низ белого блока (230+495) + 20px отступ от браузерной строки внизу */}
      <div
        className="relative bg-[#F5F5F5]"
        style={{
          width: 400,
          minWidth: 400,
          maxWidth: 400,
          minHeight: 230 + 495 + 20, // 745 — белый блок заканчивается за 20px до низа
          boxSizing: 'border-box',
        }}
      >
        {/* Header: круглые кнопки и логотип — всегда (баннер поверх при открытии) */}
        <Header onConsultationClick={handleHeaderConsultationClick} />

        {/* Cookie Banner — Group 7476: 360×120, left calc(50%-180px), top 75; Rectangle 67 + текст + кнопка по макету */}
        {showCookieBanner && (
          <div
            className="absolute z-20 box-border"
            style={{
              position: 'absolute',
              width: 360,
              height: 120,
              left: 'calc(50% - 360px / 2)',
              top: 75,
              background: '#FFFFFF',
              borderRadius: 20,
            }}
          >
            {/* Автоматически закроется через 7 — left 35px, top 90px относительно фрейма = 15px от левого/верхнего края баннера */}
            <p
              className="absolute m-0"
              style={{
                left: 15,
                top: 15,
                width: 300,
                height: 20,
                fontFamily: "'TT Firs Neue', sans-serif",
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '145%',
                color: 'rgba(16, 16, 16, 0.25)',
              }}
            >
              Автоматически закроется через {cookieTimer}
            </p>
            {/* Основной текст — left 35px, top 120px относительно фрейма = 15px от левого, 45px от верха баннера; 330×60 */}
            <p
              className="absolute m-0"
              style={{
                left: 15,
                top: 45,
                width: 330,
                minHeight: 60,
                fontFamily: "'TT Firs Neue', sans-serif",
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '105%',
                color: '#101010',
              }}
            >
              Если продолжаете использовать этот портал, вы выражаете согласие на использование файлов куки в соответствии с условиями{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#0075FF] underline">
                политики конфиденциальности
              </a>{' '}
              портала
            </p>
            {/* Vector — кнопка закрытия в зоне left 86.75% / right 9.25% / top 10.57%; цвет иконки rgba(16,16,16,0.25) */}
            <button
              type="button"
              onClick={() => setShowCookieBanner(false)}
              className="absolute cursor-pointer flex items-center justify-center bg-transparent border-0 outline-none"
              style={{
                left: '86.75%',
                right: '9.25%',
                top: '10.57%',
                bottom: '87.59%',
              }}
              aria-label="Закрыть"
            >
              <X size={16} weight="regular" color="rgba(16, 16, 16, 0.25)" />
            </button>
          </div>
        )}

        {/* Белая карточка — покрывает весь контент, 15px отступ по бокам от краёв фрейма, паддинг 15px по бокам внутри */}
        <div
          className="absolute box-border bg-white"
          style={{
            left: 15,
            right: 15,
            top: 230,
            background: '#FFFFFF',
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            padding: '12px 15px 20px 15px',
            boxSizing: 'border-box',
            gap: 8,
          }}
        >
          {/* Заголовок — 8.75% отступы, 20px, 125%, #101010 */}
          <h1
            className="mt-0 mb-0 flex-shrink-0"
            style={{
              fontFamily: "'TT Firs Neue', sans-serif",
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: 20,
              lineHeight: '125%',
              color: '#101010',
              margin: 0,
              paddingTop: 12,
              paddingBottom: 10,
            }}
          >
            Маркетплейс тарифных планов операторов на твоём адресе. Бесплатно и легко заказать
          </h1>

          {/* Поле Подключение — Group 7432: border 1px solid rgba(16,16,16,0.5), border-radius 10px */}
          <div
            role="button"
            tabIndex={0}
            className="rounded-[10px] bg-white cursor-pointer flex items-center justify-between box-border"
            style={{
              height: 50,
              minHeight: 50,
              paddingLeft: 15,
              paddingRight: 16,
              border: addressData.errors.connectionType
                ? '1px solid rgb(239, 68, 68)'
                : isFieldActive(0) || addressData.connectionType
                  ? '1px solid rgba(16, 16, 16, 0.5)'
                  : '1px solid rgba(16, 16, 16, 0.25)',
            }}
            onClick={handleConnectionTypeClick}
            onKeyDown={(e) => e.key === 'Enter' && handleConnectionTypeClick()}
          >
            <span
              style={{
                fontFamily: "'TT Firs Neue', sans-serif",
                fontWeight: 400,
                fontSize: 16,
                lineHeight: '125%',
                color: addressData.connectionType ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginRight: 8,
              }}
            >
              {addressData.connectionType ? getConnectionTypeLabel(addressData.connectionType) : 'Подключение'}
            </span>
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                width: 16,
                height: 16,
                background: addressData.errors.connectionType
                  ? 'rgb(239, 68, 68)'
                  : addressData.connectionType
                    ? '#101010'
                    : isFieldActive(0)
                      ? '#101010'
                      : 'transparent',
                border: addressData.errors.connectionType || addressData.connectionType || isFieldActive(0) ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
              }}
            >
              {addressData.connectionType ? (
                <AnimatedCheck key={`connection-${addressData.connectionType}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
              ) : (
                <CaretRight size={16} weight="regular" color={addressData.errors.connectionType || isFieldActive(0) ? '#FFFFFF' : 'rgba(16, 16, 16, 0.5)'} />
              )}
            </div>
          </div>

          {/* Поле Название населённого пункта — opacity 0.5 когда неактивно */}
          <div
            role="button"
            tabIndex={0}
            className={`rounded-[10px] bg-white flex items-center justify-between box-border ${!addressData.connectionType ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
              height: 50,
              minHeight: 50,
              paddingLeft: 15,
              paddingRight: 16,
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
            onKeyDown={(e) => e.key === 'Enter' && addressData.connectionType && (setAddressModalStep('city'), setShowAddressModal(true))}
          >
            <span
              style={{
                fontFamily: "'TT Firs Neue', sans-serif",
                fontWeight: 400,
                fontSize: 16,
                lineHeight: '125%',
                color: addressData.city ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginRight: 8,
              }}
            >
              {addressData.city || 'Название населённого пункта'}
            </span>
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                width: 16,
                height: 16,
                background: addressData.errors.city
                  ? 'rgb(239, 68, 68)'
                  : addressData.city
                    ? '#101010'
                    : isFieldActive(1)
                      ? '#101010'
                      : 'transparent',
                border: addressData.errors.city || addressData.city || isFieldActive(1) ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
              }}
            >
              {addressData.city ? (
                <AnimatedCheck key={`city-${addressData.city}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
              ) : (
                <CaretRight size={16} weight="regular" color={addressData.errors.city || isFieldActive(1) ? '#FFFFFF' : 'rgba(16, 16, 16, 0.5)'} />
              )}
            </div>
          </div>

          {/* Поле Улица */}
          <div
            role="button"
            tabIndex={0}
            className={`rounded-[10px] bg-white flex items-center justify-between box-border ${!addressData.city ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
              height: 50,
              minHeight: 50,
              paddingLeft: 15,
              paddingRight: 16,
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
            onKeyDown={(e) => e.key === 'Enter' && addressData.city && (setAddressModalStep('street'), setShowAddressModal(true))}
          >
            <span
              style={{
                fontFamily: "'TT Firs Neue', sans-serif",
                fontWeight: 400,
                fontSize: 16,
                lineHeight: '125%',
                color: addressData.street ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginRight: 8,
              }}
            >
              {addressData.street || 'Улица'}
            </span>
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                width: 16,
                height: 16,
                background: addressData.errors.street
                  ? 'rgb(239, 68, 68)'
                  : addressData.street
                    ? '#101010'
                    : isFieldActive(2)
                      ? '#101010'
                      : 'transparent',
                border: addressData.errors.street || addressData.street || isFieldActive(2) ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
              }}
            >
              {addressData.street ? (
                <AnimatedCheck key={`street-${addressData.street}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
              ) : (
                <CaretRight size={16} weight="regular" color={addressData.errors.street || isFieldActive(2) ? '#FFFFFF' : 'rgba(16, 16, 16, 0.5)'} />
              )}
            </div>
          </div>

          {/* Поле Номер дома */}
          <div
            role="button"
            tabIndex={0}
            className={`rounded-[10px] bg-white flex items-center justify-between box-border ${!addressData.street ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
              height: 50,
              minHeight: 50,
              paddingLeft: 15,
              paddingRight: 16,
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
            onKeyDown={(e) => e.key === 'Enter' && addressData.street && (setAddressModalStep('house'), setShowAddressModal(true))}
          >
            <span
              style={{
                fontFamily: "'TT Firs Neue', sans-serif",
                fontWeight: 400,
                fontSize: 16,
                lineHeight: '125%',
                color: addressData.houseNumber ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginRight: 8,
              }}
            >
              {addressData.houseNumber
                ? (addressData.apartmentNumber ? `д. ${addressData.houseNumber} кв. ${addressData.apartmentNumber}` : addressData.houseNumber)
                : 'Номер дома'}
            </span>
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                width: 16,
                height: 16,
                background: addressData.errors.houseNumber
                  ? 'rgb(239, 68, 68)'
                  : addressData.houseNumber
                    ? '#101010'
                    : isFieldActive(3)
                      ? '#101010'
                      : 'transparent',
                border: addressData.errors.houseNumber || addressData.houseNumber || isFieldActive(3) ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
              }}
            >
              {addressData.houseNumber ? (
                <AnimatedCheck key={`house-${addressData.houseNumber}-${addressData.apartmentNumber ?? ''}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
              ) : (
                <CaretRight size={16} weight="regular" color={addressData.errors.houseNumber || isFieldActive(3) ? '#FFFFFF' : 'rgba(16, 16, 16, 0.5)'} />
              )}
            </div>
          </div>

          {/* Чекбокс — border 1px solid rgba(16,16,16,0.25), border-radius 10px, 14px line-height 105% */}
          <div style={{ flexShrink: 0 }}>
            <PrivacyConsent />
          </div>

          {/* Кнопка — bg #101010, border 1px solid rgba(16,16,16,0.25), border-radius 10px, 16px line-height 315% (по макету), color #FFFFFF */}
          <button
            type="button"
            onClick={handleSubmit}
            onMouseDown={() => setIsSubmitPressed(true)}
            onMouseUp={() => setIsSubmitPressed(false)}
            onMouseLeave={() => setIsSubmitPressed(false)}
            onTouchStart={() => setIsSubmitPressed(true)}
            onTouchEnd={() => setIsSubmitPressed(false)}
            className="w-full flex items-center justify-center text-white outline-none cursor-pointer rounded-[10px] box-border"
            style={{
              height: 50,
              minHeight: 50,
              background: '#101010',
              border: '1px solid rgba(16, 16, 16, 0.25)',
              borderRadius: 10,
              fontFamily: "'TT Firs Neue', sans-serif",
              fontWeight: 400,
              fontSize: 16,
              lineHeight: '125%',
              color: '#FFFFFF',
              transform: isSubmitPressed ? 'scale(0.97)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            Показать всех операторов
          </button>
        </div>

        <ConnectionTypeModal
          isOpen={showConnectionModal}
          onClose={() => setShowConnectionModal(false)}
          onNext={() => setShowConnectionModal(false)}
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
