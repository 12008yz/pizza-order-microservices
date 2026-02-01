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

// Динамический импорт ConsultationFlow для code splitting
const ConsultationFlow = dynamic(() => import('../Frame2/ConsultationFlow'), {
  loading: () => <div>Загрузка...</div>, // Можно заменить на LoadingScreen
  ssr: false, // Отключаем SSR для этого компонента
});

type FlowState = 'form' | 'loading' | 'consultation';
type ContactMethod = 'max' | 'telegram' | 'phone';

function AddressFormContent() {
  const router = useRouter();
  const { addressData, validateForm, clearErrors, clearAddress } = useAddress();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressModalStep, setAddressModalStep] = useState<'city' | 'street' | 'house'>('city');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_submitError, setSubmitError] = useState<string | null>(null); // submitError не используется, но setSubmitError используется
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [cookieTimer, setCookieTimer] = useState(7);

  // Flow state for loading and consultation
  const [flowState, setFlowState] = useState<FlowState>('form');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Button press state for animation
  const [isSubmitPressed, setIsSubmitPressed] = useState(false);

  // Закрытие баннера cookies через 7 секунд с обратным отсчетом
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

  // Эффект для загрузочного экрана
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

  // Текущий шаг для подсветки: 0 = подключение, 1 = город, 2 = улица, 3 = дом
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
    // Очищаем все ошибки валидации при нажатии на кнопку
    clearErrors();

    // Валидация формы
    if (!validateForm()) {
      // Если форма не валидна, ошибки уже установлены в validateForm
      // Поля автоматически подсветятся красным
      return;
    }

    // Показываем загрузочный экран
    setLoadingProgress(0);
    setFlowState('loading');
  };

  const handleConsultationClose = () => {
    clearErrors();
    if (!validateForm()) {
      setFlowState('form');
      clearErrors(); // при возврате на форму не подсвечивать поля красным
      return;
    }

    // Сохраняем текущие данные в sessionStorage при закрытии модалки
    try {
      const sanitizedAddressData = {
        ...addressData,
        city: sanitizeString(addressData.city, 100),
        street: sanitizeString(addressData.street, 200),
        houseNumber: sanitizeString(addressData.houseNumber, 20),
        apartmentNumber: sanitizeString(addressData.apartmentNumber, 20),
      };
      sessionStorage.setItem('addressData', JSON.stringify(sanitizedAddressData));
      // Очищаем данные формы из sessionStorage
      sessionStorage.removeItem('addressFormData');
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error);
    }

    // Очищаем форму и переходим на тарифы
    clearAddress();
    router.push('/providers');
  };

  // Открытие консультации по клику на иконку самолёта в Header
  const handleHeaderConsultationClick = () => {
    setLoadingProgress(0);
    setFlowState('loading');
  };

  // Функция санитизации строковых данных для защиты от XSS
  const sanitizeString = (str: string | undefined, maxLength: number = 200): string | undefined => {
    if (!str) return undefined;
    // Удаляем потенциально опасные символы и ограничиваем длину
    const sanitized = str
      .trim()
      .replace(/[<>"']/g, '') // Удаляем HTML-символы
      .slice(0, maxLength);
    return sanitized || undefined;
  };

  // Функция сохранения номера телефона в базу данных (всегда вызывается при консультации)
  const savePhoneToDatabase = async (phone: string, method?: ContactMethod) => {
    if (!phone) return;

    const normalizedPhone = phone.replace(/\D/g, ''); // Только цифры

    // Валидация номера телефона - строго 11 цифр
    if (normalizedPhone.length !== 11) {
      console.error('Invalid phone number format');
      return;
    }

    // Формируем данные для сохранения (включаем все доступные данные из формы)
    const userData = {
      phone: normalizedPhone,
      city: sanitizeString(addressData.city, 100),
      street: sanitizeString(addressData.street, 200),
      house: sanitizeString(addressData.houseNumber, 20),
      apartment: sanitizeString(addressData.apartmentNumber, 20) || undefined,
      connectionType: addressData.connectionType || undefined,
      contactMethod: method || undefined,
    };

    // Отправляем данные на сервер для сохранения в базе данных
    // API автоматически объединит данные, если пользователь уже существует
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
      // Продолжаем даже если сохранение не удалось
    }
  };

  // Функция сохранения данных пользователя и перехода на тарифы
  const saveUserDataAndNavigate = async (phone?: string, method?: ContactMethod) => {
    try {
      clearErrors();
      if (!validateForm()) {
        setFlowState('form');
        clearErrors(); // при возврате на форму не подсвечивать поля красным
        return;
      }

      // Если есть телефон, сохраняем его в базу данных
      if (phone) {
        await savePhoneToDatabase(phone, method);
      }

      // Санитизируем данные перед сохранением
      const sanitizedAddressData = {
        ...addressData,
        city: sanitizeString(addressData.city, 100),
        street: sanitizeString(addressData.street, 200),
        houseNumber: sanitizeString(addressData.houseNumber, 20),
        apartmentNumber: sanitizeString(addressData.apartmentNumber, 20),
      };

      // Сохраняем данные в sessionStorage для отображения на странице тарифов
      // Используем try-catch для защиты от ошибок при работе с sessionStorage
      try {
        sessionStorage.setItem('addressData', JSON.stringify(sanitizedAddressData));
        // Очищаем данные формы из sessionStorage (addressFormData), так как данные уже отправлены
        sessionStorage.removeItem('addressFormData');
      } catch (error) {
        console.warn('Failed to save to sessionStorage:', error);
        // Продолжаем работу даже если sessionStorage недоступен
      }

      // Очищаем форму после отправки
      clearAddress();

      // Переходим на страницу тарифов только если все поля заполнены
      router.push('/providers');
    } catch (error) {
      console.error('Error in saveUserDataAndNavigate:', error);
      // В случае ошибки возвращаемся на форму
      setFlowState('form');
    }
  };

  // Обработка отправки данных консультации (с телефоном и методом связи)
  const handleConsultationSubmit = async (data: { phone?: string; method?: ContactMethod }) => {
    // Убрали console.log для production
    await saveUserDataAndNavigate(data.phone, data.method);
  };

  // Обработка пропуска консультации ("Нет, спасибо")
  const handleConsultationSkip = async () => {
    // Убрали console.log для production
    await saveUserDataAndNavigate();
  };

  // const isFormValid = // Не используется, закомментировано
  //   addressData.connectionType &&
  //   (addressData.cityId || addressData.city) &&
  //   (addressData.streetId || addressData.street) &&
  //   (addressData.buildingId || addressData.houseNumber) &&
  //   addressData.privacyConsent;

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F5F5F5] overflow-hidden">
      <div className="relative w-[400px] h-[870px] bg-[#F5F5F5]">
        <div className="absolute left-0 right-[0.06%] top-[10%] bottom-[10%] bg-[#F5F5F5]" />

        {!showCookieBanner && <Header onConsultationClick={handleHeaderConsultationClick} />}

        <div className="absolute left-[5%] right-[5%] top-[29.74%] bottom-[16.67%] bg-white backdrop-blur-[7.5px] rounded-[20px]" />

        <div className="absolute left-[8.75%] right-[8.75%] top-[31.26%] bottom-[59.77%] font-normal text-xl leading-[125%] text-[#101010] flex items-start" style={{ letterSpacing: '0.5px' }}>
          Маркетплейс тарифных планов, операторов на твоем адресе. Бесплатно заказать «wi-fi»
        </div>

        <div className="absolute left-[8.75%] right-[8.75%] top-[41.98%] bottom-[51.72%]">
          <div
            className="relative w-full rounded-[10px] bg-white"
            style={{
              border: addressData.errors.connectionType
                ? '0.5px solid rgb(239, 68, 68)'
                : isFieldActive(0) || addressData.connectionType
                  ? '0.5px solid #101010'
                  : '0.5px solid rgba(16, 16, 16, 0.25)',
            }}
          >
            <div
              onClick={handleConnectionTypeClick}
              className="relative w-full h-full px-[15px] rounded-[10px] bg-transparent cursor-pointer flex items-center justify-between"
              style={{ paddingTop: '15.5px', paddingBottom: '14px' }}
            >
              <span
                className={`text-base leading-[125%] flex-1 ${addressData.connectionType ? 'text-[#101010]' : 'text-[rgba(16,16,16,0.5)]'
                  }`}
                style={{
                  letterSpacing: '0.5px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  marginRight: '8px'
                }}
              >
                {addressData.connectionType
                  ? getConnectionTypeLabel(addressData.connectionType)
                  : 'Подключение'}
              </span>
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  addressData.connectionType
                    ? 'bg-[#9CA3AF]'
                    : isFieldActive(0)
                      ? 'bg-[#101010]'
                      : 'border border-[rgba(16,16,16,0.25)]'
                }`}
                style={{
                  borderWidth: '0.5px',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
              >
                {addressData.connectionType ? (
                  <AnimatedCheck key={`connection-${addressData.connectionType}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
                ) : (
                  <CaretRight size={8} weight="regular" color="#FFFFFF" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute left-[8.75%] right-[8.75%] top-[48.37%] bottom-[45.4%]">
          <div
            onClick={() => {
              setAddressModalStep('city');
              setShowAddressModal(true);
            }}
            className={`relative w-full rounded-[10px] bg-white cursor-pointer ${addressData.city ? '' : ''
              }`}
            style={{
              border: addressData.errors.city
                ? '0.5px solid rgb(239, 68, 68)'
                : isFieldActive(1) || addressData.city
                  ? '0.5px solid #101010'
                  : '0.5px solid rgba(16, 16, 16, 0.25)',
            }}
          >
            <div
              className="relative w-full h-full px-[15px] rounded-[10px] bg-transparent flex items-center justify-between"
              style={{ paddingTop: '15.5px', paddingBottom: '14px' }}
            >
              <span
                className={`text-base leading-[125%] flex-1 ${addressData.city ? 'text-[#101010]' : 'text-[rgba(16,16,16,0.5)]'
                  }`}
                style={{
                  letterSpacing: '0.5px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  marginRight: '8px'
                }}
              >
                {addressData.city || 'Название населённого пункта'}
              </span>
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  addressData.city
                    ? 'bg-[#9CA3AF]'
                    : isFieldActive(1)
                      ? 'bg-[#101010]'
                      : 'border border-[rgba(16,16,16,0.25)]'
                }`}
                style={{
                  borderWidth: '0.5px',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
              >
                {addressData.city ? (
                  <AnimatedCheck key={`city-${addressData.city}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
                ) : (
                  <CaretRight size={8} weight="regular" color="#FFFFFF" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute left-[8.75%] right-[8.75%] top-[54.72%] bottom-[39.08%]">
          <div
            onClick={() => {
              if (addressData.city) {
                setAddressModalStep('street');
                setShowAddressModal(true);
              }
            }}
            className={`relative w-full rounded-[10px] bg-white ${!addressData.city ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            style={{
              border: addressData.errors.street
                ? '0.5px solid rgb(239, 68, 68)'
                : isFieldActive(2) || addressData.street
                  ? '0.5px solid #101010'
                  : '0.5px solid rgba(16, 16, 16, 0.25)',
            }}
          >
            <div
              className="relative w-full h-full px-[15px] rounded-[10px] bg-transparent flex items-center justify-between"
              style={{ paddingTop: '15.5px', paddingBottom: '13.5px' }}
            >
              <span
                className={`text-base leading-[125%] flex-1 ${addressData.street ? 'text-[#101010]' : 'text-[rgba(16,16,16,0.5)]'
                  }`}
                style={{
                  letterSpacing: '0.5px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  marginRight: '8px'
                }}
              >
                {addressData.street || 'Улица'}
              </span>
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  addressData.street
                    ? 'bg-[#9CA3AF]'
                    : isFieldActive(2)
                      ? 'bg-[#101010]'
                      : 'border border-[rgba(16,16,16,0.25)]'
                }`}
                style={{
                  borderWidth: '0.5px',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
              >
                {addressData.street ? (
                  <AnimatedCheck key={`street-${addressData.street}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
                ) : (
                  <CaretRight size={8} weight="regular" color="#FFFFFF" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute left-[8.75%] right-[8.75%] top-[61.04%] bottom-[32.76%]">
          <div
            onClick={() => {
              if (addressData.street) {
                setAddressModalStep('house');
                setShowAddressModal(true);
              }
            }}
            className={`relative w-full rounded-[10px] bg-white ${!addressData.street ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            style={{
              border: addressData.errors.houseNumber
                ? '0.5px solid rgb(239, 68, 68)'
                : isFieldActive(3) || addressData.houseNumber
                  ? '0.5px solid #101010'
                  : '0.5px solid rgba(16, 16, 16, 0.25)',
            }}
          >
            <div
              className="relative w-full h-full px-[15px] rounded-[10px] bg-transparent flex items-center justify-between"
              style={{ paddingTop: '15.5px', paddingBottom: '13.5px' }}
            >
              <span
                className={`text-base leading-[125%] flex-1 ${addressData.houseNumber ? 'text-[#101010]' : 'text-[rgba(16,16,16,0.5)]'
                  }`}
                style={{
                  letterSpacing: '0.5px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  marginRight: '8px'
                }}
              >
                {addressData.houseNumber
                  ? (addressData.apartmentNumber
                    ? `д. ${addressData.houseNumber} кв. ${addressData.apartmentNumber}`
                    : addressData.houseNumber)
                  : 'Номер дома'}
              </span>
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  addressData.houseNumber
                    ? 'bg-[#9CA3AF]'
                    : isFieldActive(3)
                      ? 'bg-[#101010]'
                      : 'border border-[rgba(16,16,16,0.25)]'
                }`}
                style={{
                  borderWidth: '0.5px',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
              >
                {addressData.houseNumber ? (
                  <AnimatedCheck key={`house-${addressData.houseNumber}-${addressData.apartmentNumber ?? ''}`} size={8} color="#FFFFFF" strokeWidth={1.5} />
                ) : (
                  <CaretRight size={8} weight="regular" color="#FFFFFF" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute left-[8.75%] right-[8.75%]"
          style={{
            marginTop: '6px',
            top: '66.76%',
            bottom: '26.44%',
          }}
        >
          <PrivacyConsent />
        </div>

        <div
          className="absolute left-[8.75%] right-[8.75%]"
          style={{
            top: '75.71%',
            bottom: '18.39%',
          }}
        >
          <button
            onClick={handleSubmit}
            onMouseDown={() => setIsSubmitPressed(true)}
            onMouseUp={() => setIsSubmitPressed(false)}
            onMouseLeave={() => setIsSubmitPressed(false)}
            onTouchStart={() => setIsSubmitPressed(true)}
            onTouchEnd={() => setIsSubmitPressed(false)}
            className="box-border absolute left-0 right-0 top-0 bottom-0 rounded-[10px] flex items-center justify-center font-normal text-base leading-[315%] text-center text-white outline-none bg-[#101010] hover:bg-gray-800 cursor-pointer"
            style={{
              letterSpacing: '0.5px',
              transform: isSubmitPressed ? 'scale(0.97)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            Показать всех операторов
          </button>
        </div>

        {showCookieBanner && (
          <div
            className="absolute z-20 bg-white rounded-[20px]"
            style={{
              width: '360px',
              height: '120px',
              left: '20px',
              top: '75px',
              boxSizing: 'border-box',
            }}
          >
            {/* Текст таймера */}
            <div
              className="absolute font-normal"
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '165%',
                color: 'rgba(16, 16, 16, 0.25)',
                width: '300px',
                height: '20px',
                left: '15px',
                top: '15px',
              }}
            >
              Автоматически закроется через {cookieTimer}
            </div>

            {/* Основной текст */}
            <div
              className="absolute font-normal"
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '105%',
                color: '#101010',
                width: '330px',
                height: '60px',
                left: '15px',
                top: '45px',
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
                width: '20px',
                height: '20px',
                right: '15px',
                top: '15px',
              }}
            >
              <X size={16} weight="regular" color="rgba(16, 16, 16, 0.5)" />
            </button>
          </div>
        )}

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
