'use client';

import { useState, useEffect } from 'react';
import { AddressProvider, useAddress, ConnectionType } from '../contexts/AddressContext';
import AddressAutocomplete from './AddressAutocomplete';
import ConnectionTypeModal from './ConnectionTypeModal';
import AddressInputModal from './AddressInputModal';
import PrivacyConsent from './PrivacyConsent';
import { availabilityService } from '../services/availability.service';
import { locationsService } from '../services/locations.service';
import { useRouter } from 'next/navigation';

// Внутренний компонент, использующий контекст
function AddressFormContent() {
  const router = useRouter();
  const { addressData, validateForm, updateConnectionType, updateCity, updateStreet, updateHouseNumber, updateApartmentNumber } = useAddress();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressModalStep, setAddressModalStep] = useState<'city' | 'street' | 'house' | 'apartment'>('city');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [cookieTimer, setCookieTimer] = useState(7);

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

    // Валидация формы
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Сохраняем адрес в БД, если его там нет
      let finalCityId = addressData.cityId;
      let finalStreetId = addressData.streetId;
      let finalBuildingId = addressData.buildingId;

      // Создаем или находим город, если его нет в БД
      if (!finalCityId && addressData.city) {
        try {
          const cityResponse = await locationsService.createCity({
            name: addressData.city,
            regionId: addressData.regionId,
          });
          if (cityResponse.success && cityResponse.data) {
            finalCityId = cityResponse.data.id;
            // Получаем regionId из ответа или используем существующий
            const regionId = cityResponse.data.regionId || cityResponse.data.region?.id || addressData.regionId;
            // Обновляем контекст с новым cityId и regionId
            updateCity(finalCityId, addressData.city, regionId);
          } else {
            throw new Error(cityResponse.error || 'Не удалось создать город');
          }
        } catch (error: any) {
          console.error('Error creating city:', error);
          setSubmitError(error.message || 'Не удалось сохранить город. Попробуйте еще раз.');
          setIsSubmitting(false);
          return;
        }
      }

      // Создаем или находим улицу, если ее нет в БД
      if (!finalStreetId && addressData.street && finalCityId) {
        try {
          const streetResponse = await locationsService.createStreet({
            name: addressData.street,
            cityId: finalCityId,
          });
          if (streetResponse.success && streetResponse.data) {
            finalStreetId = streetResponse.data.id;
            // Обновляем контекст с новым streetId
            updateStreet(finalStreetId, addressData.street);
          } else {
            throw new Error(streetResponse.error || 'Не удалось создать улицу');
          }
        } catch (error: any) {
          console.error('Error creating street:', error);
          setSubmitError(error.message || 'Не удалось сохранить улицу. Попробуйте еще раз.');
          setIsSubmitting(false);
          return;
        }
      }

      // Создаем или находим дом, если его нет в БД
      if (!finalBuildingId && addressData.houseNumber && finalStreetId) {
        try {
          // Парсим номер дома (может быть "9", "9 к 5", "9-11" и т.д.)
          const houseParts = addressData.houseNumber.split(/[кК]/);
          const houseNumber = houseParts[0].trim();
          const building = houseParts[1]?.trim();

          const buildingResponse = await locationsService.createBuilding({
            number: houseNumber,
            streetId: finalStreetId,
            building: building,
          });
          if (buildingResponse.success && buildingResponse.data) {
            finalBuildingId = buildingResponse.data.id;
            // Обновляем контекст с новым buildingId
            updateHouseNumber(finalBuildingId, addressData.houseNumber, undefined);
          } else {
            throw new Error(buildingResponse.error || 'Не удалось создать дом');
          }
        } catch (error: any) {
          console.error('Error creating building:', error);
          setSubmitError(error.message || 'Не удалось сохранить номер дома. Попробуйте еще раз.');
          setIsSubmitting(false);
          return;
        }
      }

      // Подготавливаем данные для API проверки доступности
      const checkParams = {
        city: addressData.city || '',
        street: addressData.street,
        house: addressData.houseNumber ? parseInt(addressData.houseNumber) : undefined,
        buildingId: finalBuildingId,
      };

      // Проверяем доступность провайдеров
      const response = await availabilityService.checkAvailability(checkParams);

      if (response.success && response.data) {
        // Сохраняем данные адреса в sessionStorage для использования на следующей странице
        sessionStorage.setItem('addressData', JSON.stringify(addressData));
        sessionStorage.setItem('providers', JSON.stringify(response.data));

        // Переходим на страницу результатов
        router.push('/providers');
      } else {
        setSubmitError(response.error || 'Не удалось найти провайдеров по данному адресу');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      setSubmitError(error.message || 'Произошла ошибка при проверке доступности');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    addressData.connectionType &&
    (addressData.cityId || addressData.city) &&
    (addressData.streetId || addressData.street) &&
    (addressData.buildingId || addressData.houseNumber) &&
    // Для типа "apartment" требуется номер квартиры
    (addressData.connectionType !== 'apartment' || addressData.apartmentId || addressData.apartmentNumber) &&
    addressData.privacyConsent;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white overflow-hidden">
      {/* Main Container */}
      <div className="relative w-[400px] h-[870px] bg-white">
        {/* Vector - верхний фон (белый) */}
        <div className="absolute left-0 right-[0.06%] top-[10%] bottom-[10%] bg-white" />

        {/* Group 7545 - Шапка */}
        {!showCookieBanner && (
          <>
            {/* Group 7510 - Кнопка дом (слева) */}
            <div
              className="absolute w-10 h-10 left-5 top-[65px] cursor-pointer z-10"
              onClick={() => router.push('/')}
            >
              <div
                style={{
                  boxSizing: 'border-box',
                  position: 'absolute',
                  width: '40px',
                  height: '40px',
                  border: '1px solid rgba(16, 16, 16, 0.15)',
                  backdropFilter: 'blur(5px)',
                  borderRadius: '100px',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* HouseLine icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 7.5L10 1.875L17.5 7.5V16.25C17.5 16.5815 17.3683 16.8995 17.1339 17.1339C16.8995 17.3683 16.5815 17.5 16.25 17.5H3.75C3.41848 17.5 3.10054 17.3683 2.86612 17.1339C2.6317 16.8995 2.5 16.5815 2.5 16.25V7.5Z"
                    stroke="#101010"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.5 17.5V10H12.5V17.5"
                    stroke="#101010"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* гигапоиск 2 - Логотип (по центру) */}
            <div
              className="absolute"
              style={{
                width: '140px',
                height: '10px',
                left: '70px',
                top: '80px',
              }}
            >
              <svg
                width="140"
                height="10"
                viewBox="0 0 230 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
              >
                <g clipPath="url(#clip0_13653_131)">
                  <path
                    d="M0 13.8056V0.194444H22.5306V4.86111H5.93306V13.8056H0ZM49.0092 0.194444V13.8056H43.0761V6.02778L29.9708 13.8056H24.0377V0.194444H29.9708V7.97222L43.0761 0.194444H49.0092ZM50.5142 13.8056V0.194444H73.0448V4.86111H56.4473V13.8056H50.5142ZM84.0292 4.47222L81.288 7.97222H86.7705L84.0292 4.47222ZM80.6872 0.194444H87.3713L98.017 13.8056H91.3329L89.8121 11.8611H78.2464L76.7256 13.8056H70.0415L80.6872 0.194444ZM98.7731 13.8056V0.194444H123.744V13.8056H117.811V4.86111H104.706V13.8056H98.7731ZM131.454 0H145.16C148.784 0 151.732 3.24722 151.732 7C151.732 10.7528 148.784 14 145.16 14H131.454C127.831 14 124.883 10.7528 124.883 7C124.883 3.24722 127.831 0 131.454 0ZM143.94 5.05556H132.675C131.642 5.05556 130.797 5.93056 130.797 7C130.797 8.06944 131.642 8.94444 132.675 8.94444H143.94C144.973 8.94444 145.818 8.06944 145.818 7C145.818 5.93056 144.973 5.05556 143.94 5.05556ZM177.834 0.194444V13.8056H171.901V6.02778L158.796 13.8056H152.863V0.194444H158.796V7.97222L171.901 0.194444H177.834ZM203.38 8.75V13.8056H185.544C181.92 13.8056 178.972 10.7528 178.972 7C178.972 3.24722 181.92 0.194444 185.544 0.194444H203.38V5.25H186.764C185.732 5.25 184.887 5.93056 184.887 7C184.887 8.06944 185.732 8.75 186.764 8.75H203.38ZM204.88 13.8056V0.194444H210.813V7.66111L221.252 0.194444H229.852L220.332 7L229.852 13.8056H221.252L216.033 10.0722L210.813 13.8056H204.88Z"
                    fill="#101010"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_13653_131">
                    <rect width="230" height="14" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>

            {/* Group 7509 - Кнопка самолет (справа) */}
            <div
              className="absolute w-10 h-10 left-[340px] top-[65px] cursor-pointer z-10"
              onClick={() => console.log('Share clicked')}
            >
              <div
                style={{
                  boxSizing: 'border-box',
                  position: 'absolute',
                  width: '40px',
                  height: '40px',
                  border: '1px solid rgba(16, 16, 16, 0.15)',
                  backdropFilter: 'blur(5px)',
                  borderRadius: '100px',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* PaperPlane icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.5 2.5L9.16667 10.8333M17.5 2.5L12.0833 17.5L9.16667 10.8333M17.5 2.5L2.5 7.91667L9.16667 10.8333"
                    stroke="#101010"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </>
        )}

        {/* Rectangle 30 - Основной контейнер формы */}
        <div className="absolute left-[5%] right-[5%] top-[29.74%] bottom-[16.67%] bg-white border border-[rgba(16,16,16,0.15)] backdrop-blur-[7.5px] rounded-[20px]" />

        {/* Текст заголовка */}
        <div className="absolute left-[8.75%] right-[8.75%] top-[31.26%] bottom-[59.77%] font-normal text-xl leading-[125%] text-[#101010] flex items-start" style={{ letterSpacing: '0.5px' }}>
          Маркетплейс тарифных планов, операторов на твоем адресе. Бесплатно заказать «wi-fi»
        </div>

        {/* Group 7432 - Поле "Подключение" (Select) */}
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
              {/* Кружок со стрелкой или галочкой */}
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${addressData.connectionType
                  ? 'bg-[#101010]'
                  : 'border border-[rgba(16,16,16,0.25)]'
                  }`}
                style={{
                  borderWidth: '0.5px',
                }}
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  {addressData.connectionType ? (
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      d="M4.5 3L7.5 6L4.5 9"
                      stroke="rgba(16, 16, 16, 0.25)"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </div>
            </div>
          </div>
          {addressData.errors.connectionType && (
            <div className="absolute -bottom-5 left-0 text-xs text-red-500" style={{ letterSpacing: '0.5px' }}>
              {addressData.errors.connectionType}
            </div>
          )}
        </div>

        {/* Group 7514 - Поле "Название населённого пункта" */}
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
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  {addressData.city ? (
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      d="M4.5 3L7.5 6L4.5 9"
                      stroke="rgba(16, 16, 16, 0.25)"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </div>
            </div>
          </div>
          {addressData.errors.city && (
            <div className="absolute -bottom-5 left-0 text-xs text-red-500" style={{ letterSpacing: '0.5px' }}>
              {addressData.errors.city}
            </div>
          )}
        </div>

        {/* Group 7437 - Поле "Улица" */}
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
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  {addressData.street ? (
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      d="M4.5 3L7.5 6L4.5 9"
                      stroke="rgba(16, 16, 16, 0.25)"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </div>
            </div>
          </div>
          {addressData.errors.street && (
            <div className="absolute -bottom-5 left-0 text-xs text-red-500" style={{ letterSpacing: '0.5px' }}>
              {addressData.errors.street}
            </div>
          )}
        </div>

        {/* Group 7438 - Поле "Номер дома" */}
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
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  {addressData.houseNumber ? (
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      d="M4.5 3L7.5 6L4.5 9"
                      stroke="rgba(16, 16, 16, 0.25)"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </div>
            </div>
          </div>
          {addressData.errors.houseNumber && (
            <div className="absolute -bottom-5 left-0 text-xs text-red-500" style={{ letterSpacing: '0.5px' }}>
              {addressData.errors.houseNumber}
            </div>
          )}
        </div>

        {/* Group 7439 - Поле "Номер квартиры" (только для типа подключения "apartment") */}
        {addressData.connectionType === 'apartment' && (
          <div className="absolute left-[8.75%] right-[8.75%] top-[67.36%] bottom-[26.44%]">
            <div
              onClick={() => {
                if (addressData.houseNumber) {
                  setAddressModalStep('apartment');
                  setShowAddressModal(true);
                }
              }}
              className={`relative w-full rounded-[10px] bg-white ${!addressData.houseNumber ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              style={{
                border: addressData.apartmentNumber
                  ? '0.5px solid #101010'
                  : addressData.errors.apartmentNumber
                    ? '0.5px solid rgb(239, 68, 68)'
                    : '0.5px solid rgba(16, 16, 16, 0.25)',
              }}
            >
              <div
                className="relative w-full h-full px-[15px] rounded-[10px] bg-transparent flex items-center justify-between"
                style={{ paddingTop: '15.5px', paddingBottom: '13.5px' }}
              >
                <span
                  className={`text-base leading-[125%] ${addressData.apartmentNumber ? 'text-[#101010]' : 'text-[rgba(16,16,16,0.5)]'
                    }`}
                  style={{ letterSpacing: '0.5px' }}
                >
                  {addressData.apartmentNumber || 'Номер квартиры'}
                </span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${addressData.apartmentNumber ? 'bg-[#101010]' : 'border border-[rgba(16,16,16,0.25)]'
                    }`}
                  style={{ borderWidth: '0.5px' }}
                >
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    {addressData.apartmentNumber ? (
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : (
                      <path
                        d="M4.5 3L7.5 6L4.5 9"
                        stroke="rgba(16, 16, 16, 0.25)"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                </div>
              </div>
            </div>
            {addressData.errors.apartmentNumber && (
              <div className="absolute -bottom-5 left-0 text-xs text-red-500" style={{ letterSpacing: '0.5px' }}>
                {addressData.errors.apartmentNumber}
              </div>
            )}
          </div>
        )}

        {/* Group 7372 - Чекбокс согласия */}
        <div
          className="absolute left-[8.75%] right-[8.75%]"
          style={{
            marginTop: '6px',
            top: addressData.connectionType === 'apartment' ? '73.68%' : '66.76%',
            bottom: addressData.connectionType === 'apartment' ? '20.12%' : '26.44%',
          }}
        >
          <PrivacyConsent />
        </div>

        {/* Group 7377 - Кнопка "Показать всех операторов" */}
        <div
          className="absolute left-[8.75%] right-[8.75%]"
          style={{
            top: addressData.connectionType === 'apartment' ? '79.71%' : '75.71%',
            bottom: addressData.connectionType === 'apartment' ? '14.39%' : '18.39%',
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className={`box-border absolute left-0 right-0 top-0 bottom-0 rounded-[10px] flex items-center justify-center font-normal text-base leading-[315%] text-center text-white outline-none transition-colors ${isFormValid && !isSubmitting
              ? 'bg-[#101010] hover:bg-gray-800 cursor-pointer'
              : 'bg-[rgba(16,16,16,0.25)] cursor-not-allowed'
              }`}
            style={{ letterSpacing: '0.5px' }}
          >
            {isSubmitting ? 'Загрузка...' : 'Показать всех операторов'}
          </button>
          {submitError && (
            <div className="absolute -bottom-6 left-0 right-0 text-xs text-red-500 text-center" style={{ letterSpacing: '0.5px' }}>
              {submitError}
            </div>
          )}
        </div>

        {/* Group 7476 - Уведомление о cookies */}
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

        {/* Модальное окно выбора типа подключения */}
        <ConnectionTypeModal
          isOpen={showConnectionModal}
          onClose={() => setShowConnectionModal(false)}
          onNext={() => {
            // Только закрываем модалку, не открываем следующую автоматически
            setShowConnectionModal(false);
          }}
        />

        {/* Модальное окно ввода адреса */}
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

// Главный компонент с провайдером контекста
export default function AddressFormPage() {
  return (
    <AddressProvider>
      <AddressFormContent />
    </AddressProvider>
  );
}
