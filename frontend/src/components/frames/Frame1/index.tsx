'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CaretDown, CaretRight, Check } from '@phosphor-icons/react';
import { AddressProvider, useAddress, ConnectionType } from '../../../contexts/AddressContext';
import ConnectionTypeModal from '../../modals/ConnectionTypeModal';
import AddressInputModal from '../../modals/AddressInputModal';
import PrivacyConsent from './PrivacyConsent';
import Header from '../../layout/Header';
import LoadingScreen from '../../LoadingScreen';
import ConsultationFlow from '../Frame2/ConsultationFlow';

type FlowState = 'form' | 'loading' | 'consultation';
type ContactMethod = 'max' | 'telegram' | 'phone';

function AddressFormContent() {
  const router = useRouter();
  const { addressData, validateForm, clearErrors } = useAddress();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressModalStep, setAddressModalStep] = useState<'city' | 'street' | 'house'>('city');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [cookieTimer, setCookieTimer] = useState(7);

  // Flow state for loading and consultation
  const [flowState, setFlowState] = useState<FlowState>('form');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Закрытие баннера cookies через 7 секунд с обратным отсчетом
  useEffect(() => {
    if (showCookieBanner && cookieTimer > 0) {
      const timer = setInterval(() => {
        setCookieTimer((prev) => {
          if (prev <= 1) {
            setShowCookieBanner(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showCookieBanner, cookieTimer]);

  // Эффект для загрузочного экрана
  useEffect(() => {
    if (flowState === 'loading') {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setFlowState('consultation');
            return 100;
          }
          return prev + 5;
        });
      }, 30);

      return () => clearInterval(interval);
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
    setFlowState('form');
    setLoadingProgress(0);
  };

  // Функция сохранения данных пользователя и перехода на тарифы
  const saveUserDataAndNavigate = async (phone?: string, method?: ContactMethod) => {
    try {
      // Сохраняем данные в sessionStorage для отображения на странице тарифов
      sessionStorage.setItem('addressData', JSON.stringify(addressData));

      // Если есть телефон, сохраняем данные пользователя в базу данных
      if (phone) {
        const userData = {
          phone: phone.replace(/\D/g, ''), // Только цифры
          city: addressData.city,
          street: addressData.street,
          house: addressData.houseNumber,
          apartment: addressData.apartmentNumber || undefined,
          connectionType: addressData.connectionType,
          contactMethod: method,
        };

        // Отправляем данные на сервер для сохранения в базе данных
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
      }

      // Переходим на страницу тарифов
      router.push('/providers');
    } catch (error) {
      console.error('Error in saveUserDataAndNavigate:', error);
      // В случае ошибки всё равно переходим на страницу тарифов
      router.push('/providers');
    }
  };

  // Обработка отправки данных консультации (с телефоном и методом связи)
  const handleConsultationSubmit = async (data: { phone?: string; method?: ContactMethod }) => {
    console.log('Consultation submitted:', data);
    await saveUserDataAndNavigate(data.phone, data.method);
  };

  // Обработка пропуска консультации ("Нет, спасибо")
  const handleConsultationSkip = async () => {
    console.log('Consultation skipped');
    await saveUserDataAndNavigate();
  };

  const isFormValid =
    addressData.connectionType &&
    (addressData.cityId || addressData.city) &&
    (addressData.streetId || addressData.street) &&
    (addressData.buildingId || addressData.houseNumber) &&
    addressData.privacyConsent;

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white overflow-hidden">
      <div className="relative w-[400px] h-[870px] bg-white">
        <div className="absolute left-0 right-[0.06%] top-[10%] bottom-[10%] bg-white" />

        {!showCookieBanner && <Header />}

        <div className="absolute left-[5%] right-[5%] top-[29.74%] bottom-[16.67%] bg-white border border-[rgba(16,16,16,0.15)] backdrop-blur-[7.5px] rounded-[20px]" />

        <div className="absolute left-[8.75%] right-[8.75%] top-[31.26%] bottom-[59.77%] font-normal text-xl leading-[125%] text-[#101010] flex items-start" style={{ letterSpacing: '0.5px' }}>
          Маркетплейс тарифных планов, операторов на твоем адресе. Бесплатно заказать «wi-fi»
        </div>

        <div className="absolute left-[8.75%] right-[8.75%] top-[41.98%] bottom-[51.72%]">
          <div
            className={`relative w-full rounded-[10px] bg-white ${addressData.connectionType
              ? ''
              : addressData.errors.connectionType
                ? ''
                : ''
              }`}
            style={{
              border: addressData.connectionType
                ? '0.5px solid #101010'
                : addressData.errors.connectionType
                  ? '0.5px solid rgb(239, 68, 68)'
                  : '0.5px solid rgba(16, 16, 16, 0.25)',
            }}
          >
            <div
              onClick={handleConnectionTypeClick}
              className="relative w-full h-full px-[15px] rounded-[10px] bg-transparent cursor-pointer flex items-center justify-between"
              style={{ paddingTop: '15.5px', paddingBottom: '14px' }}
            >
              <span
                className={`text-base leading-[125%] ${addressData.connectionType ? 'text-[#101010]' : 'text-[rgba(16,16,16,0.5)]'
                  }`}
                style={{ letterSpacing: '0.5px' }}
              >
                {addressData.connectionType
                  ? getConnectionTypeLabel(addressData.connectionType)
                  : 'Подключение'}
              </span>
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${addressData.connectionType
                  ? 'bg-[#101010]'
                  : 'border border-[rgba(16,16,16,0.25)]'
                  }`}
                style={{
                  borderWidth: '0.5px',
                }}
              >
                {addressData.connectionType ? (
                  <Check size={8} weight="bold" color="#FFFFFF" />
                ) : (
                  <CaretRight size={8} weight="regular" color="rgba(16, 16, 16, 0.25)" />
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
              border: addressData.city
                ? '0.5px solid #101010'
                : addressData.errors.city
                  ? '0.5px solid rgb(239, 68, 68)'
                  : '0.5px solid rgba(16, 16, 16, 0.25)',
            }}
          >
            <div
              className="relative w-full h-full px-[15px] rounded-[10px] bg-transparent flex items-center justify-between"
              style={{ paddingTop: '15.5px', paddingBottom: '14px' }}
            >
              <span
                className={`text-base leading-[125%] ${addressData.city ? 'text-[#101010]' : 'text-[rgba(16,16,16,0.5)]'
                  }`}
                style={{ letterSpacing: '0.5px' }}
              >
                {addressData.city || 'Название населённого пункта'}
              </span>
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${addressData.city ? 'bg-[#101010]' : 'border border-[rgba(16,16,16,0.25)]'
                  }`}
                style={{ borderWidth: '0.5px' }}
              >
                {addressData.city ? (
                  <Check size={8} weight="bold" color="#FFFFFF" />
                ) : (
                  <CaretRight size={8} weight="regular" color="rgba(16, 16, 16, 0.25)" />
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
              border: addressData.street
                ? '0.5px solid #101010'
                : addressData.errors.street
                  ? '0.5px solid rgb(239, 68, 68)'
                  : '0.5px solid rgba(16, 16, 16, 0.25)',
            }}
          >
            <div
              className="relative w-full h-full px-[15px] rounded-[10px] bg-transparent flex items-center justify-between"
              style={{ paddingTop: '15.5px', paddingBottom: '13.5px' }}
            >
              <span
                className={`text-base leading-[125%] ${addressData.street ? 'text-[#101010]' : 'text-[rgba(16,16,16,0.5)]'
                  }`}
                style={{ letterSpacing: '0.5px' }}
              >
                {addressData.street || 'Улица'}
              </span>
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${addressData.street ? 'bg-[#101010]' : 'border border-[rgba(16,16,16,0.25)]'
                  }`}
                style={{ borderWidth: '0.5px' }}
              >
                {addressData.street ? (
                  <Check size={8} weight="bold" color="#FFFFFF" />
                ) : (
                  <CaretRight size={8} weight="regular" color="rgba(16, 16, 16, 0.25)" />
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
              border: addressData.houseNumber
                ? '0.5px solid #101010'
                : addressData.errors.houseNumber
                  ? '0.5px solid rgb(239, 68, 68)'
                  : '0.5px solid rgba(16, 16, 16, 0.25)',
            }}
          >
            <div
              className="relative w-full h-full px-[15px] rounded-[10px] bg-transparent flex items-center justify-between"
              style={{ paddingTop: '15.5px', paddingBottom: '13.5px' }}
            >
              <span
                className={`text-base leading-[125%] ${addressData.houseNumber ? 'text-[#101010]' : 'text-[rgba(16,16,16,0.5)]'
                  }`}
                style={{ letterSpacing: '0.5px' }}
              >
                {addressData.houseNumber || 'Номер дома'}
              </span>
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${addressData.houseNumber ? 'bg-[#101010]' : 'border border-[rgba(16,16,16,0.25)]'
                  }`}
                style={{ borderWidth: '0.5px' }}
              >
                {addressData.houseNumber ? (
                  <Check size={8} weight="bold" color="#FFFFFF" />
                ) : (
                  <CaretRight size={8} weight="regular" color="rgba(16, 16, 16, 0.25)" />
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
            className="box-border absolute left-0 right-0 top-0 bottom-0 rounded-[10px] flex items-center justify-center font-normal text-base leading-[315%] text-center text-white outline-none transition-colors bg-[#101010] hover:bg-gray-800 cursor-pointer"
            style={{ letterSpacing: '0.5px' }}
          >
            Показать всех операторов
          </button>
        </div>

        {showCookieBanner && (
          <div className="absolute w-[360px] h-[115px] left-5 top-[70px] z-20">
            <div className="box-border absolute w-[360px] h-[115px] bg-white border border-[rgba(16,16,16,0.15)] backdrop-blur-[7.5px] rounded-[20px]" style={{ padding: '15px 20px 15px 18px' }}>
              <div className="font-normal text-xs leading-[125%] text-[rgba(16,16,16,0.5)] mb-1" style={{ marginTop: '2px', letterSpacing: '0.5px' }}>
                Автоматически закроется через {cookieTimer}
              </div>
              <div className="font-normal text-sm leading-[105%] text-[#101010]" style={{ letterSpacing: '0.5px' }}>
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
            </div>
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
