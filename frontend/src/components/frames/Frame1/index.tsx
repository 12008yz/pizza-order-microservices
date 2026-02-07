'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from '@phosphor-icons/react';
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

/** Стрелка назад (как в модалках): тот же шеврон, error/active — цвет заливки */
const CHEVRON_PATH = 'M0.112544 5.34082L5.70367 0.114631C5.7823 0.0412287 5.88888 -5.34251e-07 6 -5.24537e-07C6.11112 -5.14822e-07 6.2177 0.0412287 6.29633 0.114631L11.8875 5.34082C11.9615 5.41513 12.0019 5.5134 11.9999 5.61495C11.998 5.7165 11.954 5.81338 11.8772 5.8852C11.8004 5.95701 11.6967 5.99815 11.5881 5.99994C11.4794 6.00173 11.3743 5.96404 11.2948 5.8948L6 0.946249L0.705204 5.8948C0.625711 5.96404 0.520573 6.00173 0.411936 5.99994C0.3033 5.99815 0.199649 5.95701 0.12282 5.88519C0.04599 5.81338 0.00198176 5.71649 6.48835e-05 5.61495C-0.00185199 5.5134 0.0384722 5.41513 0.112544 5.34082Z';

function FieldArrowIcon({ active, error }: { active: boolean; error?: boolean }) {
  const circleFill = error ? 'rgb(239, 68, 68)' : active ? '#000000' : '#FFFFFF';
  const circleStroke = error ? 'rgb(239, 68, 68)' : active ? '#000000' : 'rgba(16, 16, 16, 0.35)';
  const arrowFill = error || active ? '#FFFFFF' : '#101010';
  return (
    <span className="relative inline-block" style={{ width: 16, height: 16 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
        <circle cx="8" cy="8" r="7.5" fill={circleFill} stroke={circleStroke} strokeWidth={1} />
      </svg>
      <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute" style={{ left: 1, top: 5 }} aria-hidden>
        <path d={CHEVRON_PATH} fill={arrowFill} transform="rotate(90 6 3)" />
      </svg>
    </span>
  );
}

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
    // Не сбрасываем ошибки — при невалидной форме показываем красную обводку и стрелочки в полях
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
        height: '100dvh',
        boxSizing: 'border-box',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
        background: '#F5F5F5',
      }}
    >
      {/* 400px ширина; отступ снизу 20px + safe-area */}
      <div
        className="relative bg-[#F5F5F5]"
        style={{
          width: 400,
          minWidth: 400,
          maxWidth: 400,
          minHeight: 230 + 495 + 20,
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
            paddingTop: 12,
            paddingRight: 15,
            paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
            paddingLeft: 15,
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
                boxSizing: 'content-box',
                background: addressData.errors.connectionType
                  ? 'rgb(239, 68, 68)'
                  : isFieldActive(0) || addressData.connectionType
                    ? '#000000'
                    : '#FFFFFF',
                border: addressData.errors.connectionType || addressData.connectionType || isFieldActive(0) ? 'none' : '0.1px solid rgba(16, 16, 16, 0.2)',
              }}
            >
              {addressData.connectionType && !addressData.errors.connectionType ? (
                <AnimatedCheck key={`connection-${addressData.connectionType}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
              ) : (
                <FieldArrowIcon active={isFieldActive(0) || !!addressData.errors.connectionType} error={!!addressData.errors.connectionType} />
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
                boxSizing: 'content-box',
                background: addressData.errors.city
                  ? 'rgb(239, 68, 68)'
                  : isFieldActive(1) || addressData.city
                    ? '#000000'
                    : '#FFFFFF',
                border: addressData.errors.city || addressData.city || isFieldActive(1) ? 'none' : '0.1px solid rgba(16, 16, 16, 0.5)',
              }}
            >
              {addressData.city && !addressData.errors.city ? (
                <AnimatedCheck key={`city-${addressData.city}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
              ) : (
                <FieldArrowIcon active={isFieldActive(1) || !!addressData.errors.city} error={!!addressData.errors.city} />
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
                boxSizing: 'content-box',
                background: addressData.errors.street
                  ? 'rgb(239, 68, 68)'
                  : isFieldActive(2) || addressData.street
                    ? '#000000'
                    : '#FFFFFF',
                border: addressData.errors.street || addressData.street || isFieldActive(2) ? 'none' : '0.1px solid rgba(16, 16, 16, 0.5)',
              }}
            >
              {addressData.street && !addressData.errors.street ? (
                <AnimatedCheck key={`street-${addressData.street}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
              ) : (
                <FieldArrowIcon active={isFieldActive(2) || !!addressData.errors.street} error={!!addressData.errors.street} />
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
                boxSizing: 'content-box',
                background: addressData.errors.houseNumber
                  ? 'rgb(239, 68, 68)'
                  : isFieldActive(3) || addressData.houseNumber
                    ? '#000000'
                    : '#FFFFFF',
                border: addressData.errors.houseNumber || addressData.houseNumber || isFieldActive(3) ? 'none' : '0.1px solid rgba(16, 16, 16, 0.5)',
              }}
            >
              {addressData.houseNumber && !addressData.errors.houseNumber ? (
                <AnimatedCheck key={`house-${addressData.houseNumber}-${addressData.apartmentNumber ?? ''}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
              ) : (
                <FieldArrowIcon active={isFieldActive(3) || !!addressData.errors.houseNumber} error={!!addressData.errors.houseNumber} />
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
