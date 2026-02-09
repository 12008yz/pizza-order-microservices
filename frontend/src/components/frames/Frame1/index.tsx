'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CloseIcon } from '../../common/icons';
import { AddressProvider, useAddress, ConnectionType } from '../../../contexts/AddressContext';
import ConnectionTypeModal from '../../modals/ConnectionTypeModal';
import AddressInputModal from '../../modals/AddressInputModal';
import PrivacyConsent from './PrivacyConsent';
import Header from '../../layout/Header';
import LoadingScreen from '../../LoadingScreen';
import PageLoadingSkeleton from '../../PageLoadingSkeleton';
import AnimatedCheck from '../../common/AnimatedCheck';
import dynamic from 'next/dynamic';

const ConsultationFlow = dynamic(() => import('../Frame2/ConsultationFlow'), {
  loading: () => <PageLoadingSkeleton />,
  ssr: false,
});

/** Круг + стрелка вправо из макета (один path разбит на круг и стрелку для разной заливки по состояниям) */
const CIRCLE_PATH = 'M-3.49691e-07 8C-2.80529e-07 9.58225 0.469192 11.129 1.34824 12.4446C2.22729 13.7602 3.47672 14.7855 4.93853 15.391C6.40034 15.9965 8.00887 16.155 9.56072 15.8463C11.1126 15.5376 12.538 14.7757 13.6569 13.6569C14.7757 12.538 15.5376 11.1126 15.8463 9.56072C16.155 8.00887 15.9965 6.40034 15.391 4.93853C14.7855 3.47672 13.7602 2.22729 12.4446 1.34824C11.129 0.469192 9.58225 5.34821e-07 8 6.03983e-07C5.87895 0.00224088 3.84542 0.845815 2.34562 2.34562C0.845813 3.84543 0.00223942 5.87895 -3.49691e-07 8Z';
const ARROW_PATH = 'M7.20461 4.48769L10.2815 7.56461C10.3388 7.62177 10.3841 7.68964 10.4151 7.76434C10.4461 7.83905 10.462 7.91913 10.462 8C10.462 8.08087 10.4461 8.16095 10.4151 8.23565C10.3841 8.31036 10.3388 8.37823 10.2815 8.43538L7.20461 11.5123C7.08914 11.6278 6.93253 11.6926 6.76923 11.6926C6.60593 11.6926 6.44932 11.6278 6.33384 11.5123C6.21837 11.3968 6.1535 11.2402 6.1535 11.0769C6.1535 10.9136 6.21837 10.757 6.33384 10.6415L8.97615 8L6.33384 5.35846C6.27667 5.30129 6.23132 5.23341 6.20037 5.1587C6.16943 5.084 6.1535 5.00393 6.1535 4.92308C6.1535 4.84222 6.16943 4.76215 6.20037 4.68745C6.23132 4.61274 6.27667 4.54487 6.33384 4.48769C6.39102 4.43052 6.4589 4.38516 6.5336 4.35422C6.6083 4.32328 6.68837 4.30735 6.76923 4.30735C6.85009 4.30735 6.93015 4.32328 7.00486 4.35422C7.07956 4.38516 7.14744 4.43052 7.20461 4.48769Z';

function FieldArrowIcon({ active, error }: { active: boolean; error?: boolean }) {
  const circleFill = error ? 'rgb(239, 68, 68)' : active ? '#000000' : '#FFFFFF';
  const circleStroke = error ? 'rgb(239, 68, 68)' : active ? '#000000' : 'rgba(16, 16, 16, 0.35)';
  const arrowFill = error || active ? '#FFFFFF' : '#101010';
  // viewBox с запасом -0.5..16.5, чтобы обводка круга (stroke 1px) не обрезалась по краям
  return (
    <svg width={18} height={18} viewBox="-0.5 -0.5 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="block shrink-0 overflow-visible" style={{ overflow: 'visible' }} aria-hidden>
      <path d={CIRCLE_PATH} fill={circleFill} stroke={circleStroke} strokeWidth={1} />
      <path d={ARROW_PATH} fill={arrowFill} />
    </svg>
  );
}

type FlowState = 'form' | 'loading' | 'consultation';
type ContactMethod = 'max' | 'telegram' | 'phone';

interface AddressFormContentProps {
  isAppLoading?: boolean;
  appLoadingProgress?: number;
}

function AddressFormContent({ isAppLoading = false, appLoadingProgress = 0 }: AddressFormContentProps) {
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
  const [showSkeletonAfterAppLoad, setShowSkeletonAfterAppLoad] = useState(false);
  const [showSkeletonBeforeConsultation, setShowSkeletonBeforeConsultation] = useState(false);

  const [isSubmitPressed, setIsSubmitPressed] = useState(false);

  // После завершения загрузки приложения — коротко показываем скелетон, потом форму
  const prevAppLoadingRef = useRef(true);
  useEffect(() => {
    if (prevAppLoadingRef.current && !isAppLoading) {
      setShowSkeletonAfterAppLoad(true);
    }
    prevAppLoadingRef.current = isAppLoading;
  }, [isAppLoading]);

  useEffect(() => {
    if (!showSkeletonAfterAppLoad) return;
    const t = setTimeout(() => setShowSkeletonAfterAppLoad(false), 400);
    return () => clearTimeout(t);
  }, [showSkeletonAfterAppLoad]);

  useEffect(() => {
    if (!showSkeletonBeforeConsultation) return;
    const t = setTimeout(() => setShowSkeletonBeforeConsultation(false), 400);
    return () => clearTimeout(t);
  }, [showSkeletonBeforeConsultation]);

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
            setShowSkeletonBeforeConsultation(true);
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
        corpusNumber: sanitizeString(addressData.corpusNumber, 20),
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
      corpus: sanitizeString(addressData.corpusNumber, 20) || undefined,
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
        corpusNumber: sanitizeString(addressData.corpusNumber, 20),
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

  // 2) После загрузки приложения — при необходимости скелетон
  if (showSkeletonAfterAppLoad) {
    return <PageLoadingSkeleton />;
  }

  // 3) Переход к консультации: сначала LoadingScreen
  if (flowState === 'loading') {
    return <LoadingScreen progress={loadingProgress} />;
  }

  // 4) Перед консультацией — при необходимости скелетон
  if (flowState === 'consultation' && showSkeletonBeforeConsultation) {
    return <PageLoadingSkeleton />;
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

  // 1) Начальная загрузка: показываем LoadingScreen, форму держим в DOM скрыто (для подгрузки ресурсов)
  const formContent = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center overflow-hidden"
      style={{
        visibility: isAppLoading ? 'hidden' : 'visible',
        position: isAppLoading ? 'absolute' : undefined,
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
            {/* Основной текст — 330×60 px; «политики конфиденциальности портала» на следующей строке */}
            <p
              className="absolute m-0"
              style={{
                left: 15,
                top: 45,
                width: 330,
                height: 60,
                fontFamily: "'TT Firs Neue', sans-serif",
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '105%',
                color: '#101010',
              }}
            >
              Если продолжаете использовать этот портал,
              <br />
              вы выражаете согласие на использование
              <br />
              файлов куки в соответствии с условиями
              <br />
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#0075FF] underline">
                политики конфиденциальности
              </a>{' '}
              портал
            </p>
            {/* Кнопка закрытия — крестик по центру кнопки */}
            <button
              type="button"
              onClick={() => setShowCookieBanner(false)}
              className="absolute cursor-pointer flex items-center justify-center bg-transparent border-0 outline-none w-6 h-6"
              style={{
                right: '9.25%',
                top: '10.57%',
              }}
              aria-label="Закрыть"
            >
              <CloseIcon width={16} height={16} />
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
                width: 18,
                height: 18,
                boxSizing: 'content-box',
                background: addressData.errors.connectionType
                  ? 'rgb(239, 68, 68)'
                  : addressData.connectionType
                    ? '#6B6B6B'
                    : isFieldActive(0)
                      ? '#000000'
                      : '#FFFFFF',
                border: 'none',
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
                width: 18,
                height: 18,
                boxSizing: 'content-box',
                background: addressData.errors.city
                  ? 'rgb(239, 68, 68)'
                  : addressData.city
                    ? '#6B6B6B'
                    : isFieldActive(1)
                      ? '#000000'
                      : '#FFFFFF',
                border: 'none',
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
                width: 18,
                height: 18,
                boxSizing: 'content-box',
                background: addressData.errors.street
                  ? 'rgb(239, 68, 68)'
                  : addressData.street
                    ? '#6B6B6B'
                    : isFieldActive(2)
                      ? '#000000'
                      : '#FFFFFF',
                border: 'none',
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
                ? (addressData.corpusNumber ? `д. ${addressData.houseNumber} к ${addressData.corpusNumber}` : addressData.houseNumber)
                : 'Номер дома'}
            </span>
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                width: 18,
                height: 18,
                boxSizing: 'content-box',
                background: addressData.errors.houseNumber
                  ? 'rgb(239, 68, 68)'
                  : addressData.houseNumber
                    ? '#6B6B6B'
                    : isFieldActive(3)
                      ? '#000000'
                      : '#FFFFFF',
                border: 'none',
              }}
            >
              {addressData.houseNumber && !addressData.errors.houseNumber ? (
                <AnimatedCheck key={`house-${addressData.houseNumber}-${addressData.corpusNumber ?? ''}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
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

  return (
    <>
      {isAppLoading && <LoadingScreen progress={appLoadingProgress} />}
      {formContent}
    </>
  );
}

export interface AddressFormPageProps {
  isAppLoading?: boolean;
  appLoadingProgress?: number;
}

export default function AddressFormPage({ isAppLoading = false, appLoadingProgress = 0 }: AddressFormPageProps) {
  return (
    <AddressProvider>
      <AddressFormContent isAppLoading={isAppLoading} appLoadingProgress={appLoadingProgress} />
    </AddressProvider>
  );
}
