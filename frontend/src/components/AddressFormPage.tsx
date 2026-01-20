'use client';

import { useState, useEffect } from 'react';
import { AddressProvider, useAddress, ConnectionType } from '../contexts/AddressContext';
import AddressAutocomplete from './AddressAutocomplete';
import ConnectionTypeModal from './ConnectionTypeModal';
import PrivacyConsent from './PrivacyConsent';
import { availabilityService } from '../services/availability.service';
import { locationsService } from '../services/locations.service';
import { useRouter } from 'next/navigation';

// Внутренний компонент, использующий контекст
function AddressFormContent() {
  const router = useRouter();
  const { addressData, validateForm, updateConnectionType, updateCity, updateStreet, updateHouseNumber, updateApartmentNumber } = useAddress();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
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
      let finalApartmentId = addressData.apartmentId;

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

      // Создаем или находим квартиру, если ее нет в БД (только для типа "квартира")
      if (
        addressData.connectionType === 'apartment' &&
        !finalApartmentId &&
        addressData.apartmentNumber &&
        finalBuildingId
      ) {
        try {
          const apartmentResponse = await locationsService.createApartment({
            number: addressData.apartmentNumber,
            buildingId: finalBuildingId,
          });
          if (apartmentResponse.success && apartmentResponse.data) {
            finalApartmentId = apartmentResponse.data.id;
            // Обновляем контекст с новым apartmentId
            updateApartmentNumber(finalApartmentId, addressData.apartmentNumber);
          } else {
            throw new Error(apartmentResponse.error || 'Не удалось создать квартиру');
          }
        } catch (error: any) {
          console.error('Error creating apartment:', error);
          setSubmitError(error.message || 'Не удалось сохранить номер квартиры. Попробуйте еще раз.');
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
        apartmentId: finalApartmentId,
        apartmentNumber: addressData.apartmentNumber,
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
    (addressData.connectionType !== 'apartment' || addressData.apartmentId || addressData.apartmentNumber) &&
    addressData.privacyConsent;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white overflow-hidden">
      {/* Main Container */}
      <div className="relative w-[400px] h-[870px] bg-white">
        {/* Vector - верхний фон (белый) */}
        <div className="absolute left-0 right-[0.06%] top-[10%] bottom-[10%] bg-white" />

        {/* Group 7510 - Кнопка дом (слева) */}
        <div
          className="absolute w-10 h-10 left-5 top-[75px] cursor-pointer z-10"
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.125 9.375L10 2.5L16.875 9.375M3.125 9.375L10 12.5M3.125 9.375L10 9.375M16.875 9.375L10 12.5M16.875 9.375L10 9.375M10 12.5V17.5"
                stroke="#101010"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Group 7509 - Кнопка самолет (справа) */}
        <div
          className="absolute w-10 h-10 left-[340px] top-[75px] cursor-pointer z-10"
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 10L10 2.5L17.5 10M2.5 10L10 12.5M2.5 10L10 10M17.5 10L10 12.5M17.5 10L10 10M10 12.5V17.5"
                stroke="#101010"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* гигапоиск 2 - Логотип (по центру) */}
        <div className="absolute w-[140px] h-[10px] left-[70px] top-[90px]">
          <svg width="140" height="10" viewBox="0 0 140 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 9.80556V0.194444H12.5306V4.86111H5.93306V9.80556H0ZM29.0092 0.194444V9.80556H23.0761V6.02778L9.9708 9.80556H4.0377V0.194444H9.9708V3.97222L23.0761 0.194444H29.0092ZM30.5142 9.80556V0.194444H43.0448V4.86111H36.4473V9.80556H30.5142ZM54.0292 4.47222L51.288 7.97222H56.7705L54.0292 4.47222ZM50.6872 0.194444H57.3713L68.017 9.80556H61.3329L59.8121 7.86111H48.2464L46.7256 9.80556H40.0415L50.6872 0.194444ZM68.7731 9.80556V0.194444H83.744V9.80556H77.811V4.86111H64.706V9.80556H68.7731ZM81.454 0H95.16C98.784 0 101.732 3.24722 101.732 7C101.732 10.7528 98.784 14 95.16 14H81.454C77.831 14 74.883 10.7528 74.883 7C74.883 3.24722 77.831 0 81.454 0ZM93.94 5.05556H82.675C81.642 5.05556 80.797 5.93056 80.797 7C80.797 8.06944 81.642 8.94444 82.675 8.94444H93.94C94.973 8.94444 95.818 8.06944 95.818 7C95.818 5.93056 94.973 5.05556 93.94 5.05556ZM107.834 0.194444V9.80556H101.901V6.02778L88.796 9.80556H82.863V0.194444H88.796V3.97222L101.901 0.194444H107.834ZM123.38 8.75V9.80556H105.544C101.92 9.80556 98.972 10.7528 98.972 7C98.972 3.24722 101.92 0.194444 105.544 0.194444H123.38V5.25H106.764C105.732 5.25 104.887 5.93056 104.887 7C104.887 8.06944 105.732 8.75 106.764 8.75H123.38ZM124.88 9.80556V0.194444H130.813V7.66111L141.252 0.194444H149.852L140.332 7L149.852 9.80556H141.252L136.033 7.0722L130.813 9.80556H124.88Z"
              fill="#101010"
            />
          </svg>
        </div>

        {/* Rectangle 30 - Основной контейнер формы */}
        <div className="absolute left-[5%] right-[5%] top-[29.89%] bottom-[16.67%] bg-white border border-[rgba(16,16,16,0.15)] backdrop-blur-[7.5px] rounded-[20px]" />

        {/* Текст заголовка */}
        <div className="absolute left-[8.75%] right-[8.75%] top-[31.61%] bottom-[59.77%] font-normal text-xl leading-[125%] text-[#101010] flex items-start">
          Маркетплейс тарифных планов, операторов на твоем адресе. Бесплатно заказать «wi-fi»
        </div>

        {/* Group 7432 - Поле "Подключение" (Select) */}
        <div className="absolute left-[8.75%] right-[8.75%] top-[42.53%] bottom-[51.72%]">
          <div
            onClick={handleConnectionTypeClick}
            className={`box-border relative w-full h-full border rounded-[10px] bg-white cursor-pointer flex items-center justify-between px-[15px] ${
              addressData.connectionType
                ? 'border-[#101010]'
                : addressData.errors.connectionType
                ? 'border-red-500'
                : 'border-[rgba(16,16,16,0.25)]'
            }`}
          >
            <span
              className={`text-base leading-[125%] ${
                addressData.connectionType ? 'text-[#101010]' : 'text-[rgba(16,16,16,0.5)]'
              }`}
            >
              {addressData.connectionType
                ? getConnectionTypeLabel(addressData.connectionType)
                : 'Подключение'}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transform -rotate-90"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="#101010"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {addressData.errors.connectionType && (
            <div className="absolute -bottom-5 left-0 text-xs text-red-500">
              {addressData.errors.connectionType}
            </div>
          )}
        </div>

        {/* Group 7514 - Поле "Название населённого пункта" */}
        <div className="absolute left-[8.75%] right-[8.75%] top-[48.85%] bottom-[45.4%]">
          <AddressAutocomplete
            type="city"
            placeholder="Название населённого пункта"
            value={addressData.city}
          />
          {addressData.errors.city && (
            <div className="absolute -bottom-5 left-0 text-xs text-red-500">
              {addressData.errors.city}
            </div>
          )}
        </div>

        {/* Group 7437 - Поле "Улица" */}
        <div className="absolute left-[8.75%] right-[8.75%] top-[55.17%] bottom-[39.08%]">
          <AddressAutocomplete
            type="street"
            placeholder="Улица"
            disabled={!addressData.cityId && !addressData.city}
            value={addressData.street}
          />
          {addressData.errors.street && (
            <div className="absolute -bottom-5 left-0 text-xs text-red-500">
              {addressData.errors.street}
            </div>
          )}
        </div>

        {/* Group 7438 - Поле "Номер дома" */}
        <div className="absolute left-[8.75%] right-[8.75%] top-[61.49%] bottom-[32.76%]">
          <AddressAutocomplete
            type="house"
            placeholder="Номер дома"
            disabled={!addressData.streetId && !addressData.street}
            value={addressData.houseNumber}
          />
          {addressData.errors.houseNumber && (
            <div className="absolute -bottom-5 left-0 text-xs text-red-500">
              {addressData.errors.houseNumber}
            </div>
          )}
        </div>

        {/* Поле "Номер квартиры" - показывается только для квартир */}
        {addressData.connectionType === 'apartment' && (
          <div className="absolute left-[8.75%] right-[8.75%] top-[64.6%] bottom-[29.66%]">
            <AddressAutocomplete
              type="apartment"
              placeholder="Номер квартиры"
              disabled={!addressData.buildingId && !addressData.houseNumber}
              value={addressData.apartmentNumber}
            />
            {addressData.errors.apartmentNumber && (
              <div className="absolute -bottom-5 left-0 text-xs text-red-500">
                {addressData.errors.apartmentNumber}
              </div>
            )}
          </div>
        )}

        {/* Group 7372 - Чекбокс согласия */}
        <div
          className={`absolute left-[8.75%] right-[8.75%] ${
            addressData.connectionType === 'apartment' ? 'top-[70.5%] bottom-[23.79%]' : 'top-[67.82%] bottom-[26.44%]'
          }`}
        >
          <PrivacyConsent />
        </div>

        {/* Group 7377 - Кнопка "Показать всех операторов" */}
        <div
          className={`absolute left-[8.75%] right-[8.75%] ${
            addressData.connectionType === 'apartment' ? 'top-[78.5%] bottom-[15.75%]' : 'top-[75.86%] bottom-[18.39%]'
          }`}
        >
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className={`box-border absolute left-0 right-0 top-0 bottom-0 rounded-[10px] flex items-center justify-center font-normal text-base leading-[315%] text-center text-white outline-none transition-colors ${
              isFormValid && !isSubmitting
                ? 'bg-[#101010] hover:bg-gray-800 cursor-pointer'
                : 'bg-[rgba(16,16,16,0.25)] cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Загрузка...' : 'Показать всех операторов'}
          </button>
          {submitError && (
            <div className="absolute -bottom-6 left-0 right-0 text-xs text-red-500 text-center">
              {submitError}
            </div>
          )}
        </div>

        {/* Group 7476 - Уведомление о cookies */}
        {showCookieBanner && (
          <div className="absolute w-[360px] h-[115px] left-5 top-[75px] z-20">
            <div className="box-border absolute w-[360px] h-[115px] bg-white border border-[rgba(16,16,16,0.15)] backdrop-blur-[7.5px] rounded-[20px] p-[15px_20px]">
              <div className="font-normal text-xs leading-[125%] text-[rgba(16,16,16,0.5)] mb-1">
                Автоматически закроется через {cookieTimer}
              </div>
              <div className="font-normal text-sm leading-[105%] text-[#101010]">
                Если продолжаете использовать этот портал, вы выражаете согласие на использование
                файлов куки в соответствии с условиями политики конфиденциальности портал
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно выбора типа подключения */}
        <ConnectionTypeModal
          isOpen={showConnectionModal}
          onClose={() => setShowConnectionModal(false)}
          onNext={() => {
            setShowConnectionModal(false);
          }}
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
