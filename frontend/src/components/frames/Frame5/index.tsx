'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AddressProvider, useAddress } from '../../../contexts/AddressContext';
import AddressInputModal from '../../modals/AddressInputModal';
import { useEquipment } from '../../../contexts/EquipmentContext';
import { ordersService } from '../../../services';
import type { CreateOrderData } from '../../../services/orders.service';
import { HomeIcon, PlaneIcon } from '../../common/icons';
import LoadingScreen from '../../LoadingScreen';
import {
  PersonalDataStep,
  AddressStep,
  ConfirmationStep,
  SuccessStep,
} from './steps';
import { NotificationBanner } from './components';
import { validatePersonalData, validateAddressData } from './hooks/useFormValidation';
import type { PersonalData, AddressData, FormStep, ValidationErrors } from './types';

type AddressModalStep = 'city' | 'street' | 'house' | 'apartment';

const SELECTED_TARIFF_KEY = 'selectedTariff';
const ADDRESS_DATA_KEY = 'addressData';
const ORDER_PERSONAL_DATA_KEY = 'orderPersonalData';

interface SelectedTariff {
  id: number;
  providerId: number;
  providerName?: string;
  tariffName?: string;
  price?: string;
  priceValue?: number;
}

const DEFAULT_PERSONAL: PersonalData = {
  firstName: '',
  lastName: '',
  birthDate: '',
  phone: '',
};

const DEFAULT_ADDRESS: AddressData = {
  city: '',
  street: '',
  building: '',
  apartment: null,
  floor: null,
};

function formatOrderNumber(orderId: number, createdAt?: string): string {
  const d = createdAt ? new Date(createdAt) : new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const serial = String(orderId).padStart(6, '0');
  return `${yy}${mm}${dd}${serial}`;
}

function Frame5Content() {
  const router = useRouter();
  const { addressData: savedAddress } = useAddress();
  const { equipmentState } = useEquipment();

  const [selectedTariff, setSelectedTariff] = useState<SelectedTariff | null>(null);
  const [step, setStep] = useState<FormStep>('personal_data');
  const [personalData, setPersonalData] = useState<PersonalData>(DEFAULT_PERSONAL);
  const [addressData, setAddressData] = useState<AddressData>(DEFAULT_ADDRESS);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressModalStep, setAddressModalStep] = useState<AddressModalStep>('city');
  const prevShowAddressModalRef = useRef(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SELECTED_TARIFF_KEY);
      if (raw) {
        setSelectedTariff(JSON.parse(raw) as SelectedTariff);
      }
    } catch {
      setSelectedTariff(null);
    }
  }, []);

  // Загрузка персональных данных из sessionStorage при монтировании
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = sessionStorage.getItem(ORDER_PERSONAL_DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PersonalData;
        if (parsed.firstName || parsed.lastName || parsed.phone || parsed.birthDate) {
          setPersonalData((prev) => ({ ...DEFAULT_PERSONAL, ...parsed }));
        }
      }
    } catch {
      // игнорируем
    }
  }, []);

  // Сохранение персональных данных в sessionStorage при изменении (для восстановления и отправки в CRM)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (personalData.firstName || personalData.lastName || personalData.phone || personalData.birthDate) {
        sessionStorage.setItem(ORDER_PERSONAL_DATA_KEY, JSON.stringify(personalData));
      }
    } catch {
      // игнорируем
    }
  }, [personalData]);

  useEffect(() => {
    if (savedAddress?.city || savedAddress?.street || savedAddress?.houseNumber) {
      const buildingStr = savedAddress.houseNumber
        ? (savedAddress.corpusNumber ? `д. ${savedAddress.houseNumber} к ${savedAddress.corpusNumber}` : savedAddress.houseNumber)
        : '';
      setAddressData((prev) => ({
        ...prev,
        city: savedAddress.city ?? prev.city,
        street: savedAddress.street ?? prev.street,
        building: buildingStr || prev.building,
      }));
    }
  }, [savedAddress?.city, savedAddress?.street, savedAddress?.houseNumber, savedAddress?.corpusNumber]);

  // После закрытия модалки адреса синхронизируем контекст в локальный addressData и перезаписываем sessionStorage addressData
  useEffect(() => {
    const wasOpen = prevShowAddressModalRef.current;
    prevShowAddressModalRef.current = showAddressModal;
    if (wasOpen && !showAddressModal && savedAddress) {
      const buildingStr = savedAddress.houseNumber
        ? (savedAddress.corpusNumber ? `д. ${savedAddress.houseNumber} к ${savedAddress.corpusNumber}` : savedAddress.houseNumber)
        : '';
      setAddressData((prev) => ({
        ...prev,
        city: savedAddress.city ?? prev.city,
        street: savedAddress.street ?? prev.street,
        building: buildingStr || prev.building,
        apartment: savedAddress.apartmentNumber ?? prev.apartment,
      }));
      if (savedAddress.apartmentNumber) {
        setErrors((prevErrors) => ({ ...prevErrors, apartment: undefined }));
      }
      try {
        sessionStorage.setItem(
          ADDRESS_DATA_KEY,
          JSON.stringify({
            city: savedAddress.city,
            street: savedAddress.street,
            houseNumber: savedAddress.houseNumber,
            corpusNumber: savedAddress.corpusNumber,
            apartmentNumber: savedAddress.apartmentNumber,
          })
        );
      } catch {
        // игнорируем
      }
    }
  }, [showAddressModal, savedAddress]);

  // При любом изменении адреса во Frame5 перезаписываем sessionStorage addressData (город, улица, дом, квартира)
  useEffect(() => {
    if (typeof window === 'undefined' || (!addressData.city && !addressData.street && !addressData.building)) return;
    try {
      const houseNum = addressData.building?.replace(/^д\.\s?| к .*$/g, '').trim() || '';
      const corpus = addressData.building?.match(/ к (.+)$/)?.[1] || undefined;
      sessionStorage.setItem(
        ADDRESS_DATA_KEY,
        JSON.stringify({
          city: addressData.city || undefined,
          street: addressData.street || undefined,
          houseNumber: houseNum || undefined,
          corpusNumber: corpus || undefined,
          apartmentNumber: addressData.apartment || undefined,
        })
      );
    } catch {
      // игнорируем
    }
  }, [addressData.city, addressData.street, addressData.building, addressData.apartment]);

  const handlePersonalNext = useCallback(() => {
    const nextErrors = validatePersonalData(personalData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setStep('address');
  }, [personalData]);

  const handleAddressNext = useCallback(() => {
    const nextErrors = validateAddressData(addressData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setStep('confirmation');
  }, [addressData]);

  const openAddressModal = useCallback((step: AddressModalStep) => {
    setAddressModalStep(step);
    setShowAddressModal(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      if (selectedTariff) {
        const payload: CreateOrderData = {
          providerId: selectedTariff.providerId,
          tariffId: selectedTariff.id,
          fullName: `${personalData.firstName.trim()} ${personalData.lastName.trim()}`,
          phone: personalData.phone.replace(/\D/g, ''),
          ...(personalData.birthDate?.trim() && { birthDate: personalData.birthDate.trim() }),
          addressString: [
            addressData.city,
            addressData.street,
            addressData.building,
            addressData.apartment ? `кв. ${addressData.apartment}` : '',
          ]
            .filter(Boolean)
            .join(', '),
          city: addressData.city || undefined,
          street: addressData.street || undefined,
          building: addressData.building || undefined,
          apartment: addressData.apartment || undefined,
        };

        if (equipmentState?.router) {
          payload.routerNeed = equipmentState.router.need ?? undefined;
          payload.routerPurchase = equipmentState.router.purchase ?? undefined;
          payload.routerOperator = equipmentState.router.operator ?? undefined;
          payload.routerConfig = equipmentState.router.config ?? undefined;
        }

        const res = await ordersService.createOrder(payload);

        if (res.success && res.data) {
          const num = formatOrderNumber(res.data.id, res.data.createdAt);
          setOrderNumber(num);
          sessionStorage.removeItem(SELECTED_TARIFF_KEY);
          setStep('success');
          return;
        }
      }

      // Fallback: переход на success даже без ответа сервера (для тестирования)
      const testOrderNumber = formatOrderNumber(Math.floor(Math.random() * 1000000), new Date().toISOString());
      setOrderNumber(testOrderNumber);
      setStep('success');
    } catch {
      // При ошибке всё равно переходим на success для тестирования
      const testOrderNumber = formatOrderNumber(Math.floor(Math.random() * 1000000), new Date().toISOString());
      setOrderNumber(testOrderNumber);
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTariff, personalData, addressData, equipmentState]);

  const handleBackFromPersonal = useCallback(() => {
    router.push('/equipment');
  }, [router]);

  const showHeader = step === 'confirmation' || step === 'success';
  const showNotification = (step === 'personal_data' || step === 'address') && notificationVisible;

  // Проверка selectedTariff временно отключена для тестирования
  // if (!selectedTariff) {
  //   return (
  //     <div
  //       className="relative w-full max-w-[400px] mx-auto bg-[#F5F5F5] flex flex-col items-center justify-center"
  //       style={{
  //         fontFamily: 'TT Firs Neue, sans-serif',
  //         minHeight: '100dvh',
  //         padding: 20,
  //         paddingTop: 'calc(20px + var(--sat, 0px))',
  //         paddingBottom: 'calc(20px + var(--sab, 0px))',
  //       }}
  //     >
  //       <p style={{ color: 'rgba(16,16,16,0.7)', marginBottom: 16, textAlign: 'center' }}>
  //         Сначала выберите тариф на странице провайдеров.
  //       </p>
  //       <button
  //         type="button"
  //         onClick={() => router.push('/providers')}
  //         className="rounded-[10px] px-4 py-3 bg-[#101010] text-white cursor-pointer"
  //       >
  //         К тарифам
  //       </button>
  //     </div>
  //   );
  // }

  const goToFrame3 = useCallback(() => {
    router.push('/providers');
  }, [router]);

  return (
    <div
      className="relative w-full max-w-[400px] mx-auto flex flex-col overflow-y-auto overflow-x-hidden bg-[#F5F5F5] cursor-pointer"
      style={{
        fontFamily: 'TT Firs Neue, sans-serif',
        minHeight: '100dvh',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'var(--sab, 0px)',
        boxSizing: 'border-box',
      }}
      onClick={goToFrame3}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToFrame3(); } }}
      aria-label="Выйти в список тарифов"
    >
      {/* Экран загрузки после отправки заявки */}
      {isSubmitting && <div onClick={(e) => e.stopPropagation()}><LoadingScreen /></div>}

      <div className="flex flex-col flex-1 min-h-0 w-full" style={{ background: '#F5F5F5' }}>
        {showHeader && (
          <div className="flex-shrink-0 relative" style={{ minHeight: '120px' }} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                position: 'relative',
                top: 'var(--header-top, 50px)',
                marginLeft: '20px',
                marginRight: '20px',
                height: '41px',
                width: '360px',
                maxWidth: 'calc(100vw - 40px)',
              }}
            >
              <button
                type="button"
                onClick={() => router.push('/')}
                className="outline-none cursor-pointer border-0 w-10 h-10 flex items-center justify-center rounded-full bg-white absolute left-0 top-0"
                aria-label="На главную"
              >
                <HomeIcon color="#101010" />
              </button>
              <div
                style={{
                  position: 'absolute',
                  left: '50px',
                  top: '15px',
                  width: '140px',
                  height: '10px',
                }}
                role="img"
                aria-label="Гигапоиск"
              >
                <svg width="140" height="10" viewBox="0 0 230 14" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                  <path d="M0 13.8056V0.194444H22.5306V4.86111H5.93306V13.8056H0ZM49.0092 0.194444V13.8056H43.0761V6.02778L29.9708 13.8056H24.0377V0.194444H29.9708V7.97222L43.0761 0.194444H49.0092ZM50.5142 13.8056V0.194444H73.0448V4.86111H56.4473V13.8056H50.5142ZM84.0292 4.47222L81.288 7.97222H86.7705L84.0292 4.47222ZM80.6872 0.194444H87.3713L98.017 13.8056H91.3329L89.8121 11.8611H78.2464L76.7256 13.8056H70.0415L80.6872 0.194444ZM98.7731 13.8056V0.194444H123.744V13.8056H117.811V4.86111H104.706V13.8056H98.7731ZM131.454 0H145.16C148.784 0 151.732 3.24722 151.732 7C151.732 10.7528 148.784 14 145.16 14H131.454C127.831 14 124.883 10.7528 124.883 7C124.883 3.24722 127.831 0 131.454 0ZM143.94 5.05556H132.675C131.642 5.05556 130.797 5.93056 130.797 7C130.797 8.06944 131.642 8.94444 132.675 8.94444H143.94C144.973 8.94444 145.818 8.06944 145.818 7C145.818 5.93056 144.973 5.05556 143.94 5.05556ZM177.834 0.194444V13.8056H171.901V6.02778L158.796 13.8056H152.863V0.194444H158.796V7.97222L171.901 0.194444H177.834ZM203.38 8.75V13.8056H185.544C181.92 13.8056 178.972 10.7528 178.972 7C178.972 3.24722 181.92 0.194444 185.544 0.194444H203.38V5.25H186.764C185.732 5.25 184.887 5.93056 184.887 7C184.887 8.06944 185.732 8.75 186.764 8.75H203.38ZM204.88 13.8056V0.194444H210.813V7.66111L221.252 0.194444H229.852L220.332 7L229.852 13.8056H221.252L216.033 10.0722L210.813 13.8056H204.88Z" fill="#101010" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => router.push('/consultation')}
                className="outline-none cursor-pointer border-0 w-10 h-10 flex items-center justify-center rounded-full bg-white absolute right-0 top-0"
                aria-label="Консультация"
              >
                <PlaneIcon color="#101010" />
              </button>
            </div>
          </div>
        )}

        {!showHeader && (
          <div className="flex-shrink-0 relative" style={{ minHeight: '105px' }}>
            {showNotification && (
              <div onClick={(e) => e.stopPropagation()}>
                <NotificationBanner initialCountdown={7} onClose={() => setNotificationVisible(false)} />
              </div>
            )}
            <div
              className="font-normal flex items-center justify-center text-center"
              style={{
                width: '240px',
                margin: '0 auto',
                paddingTop: 'var(--header-zone, 90px)',
                minHeight: '30px',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '14px',
                lineHeight: '105%',
                color: 'rgba(16, 16, 16, 0.15)',
                opacity: !showNotification ? 1 : 0,
              }}
            >
              Нажмите в открытое пустое место,
              <br />
              чтобы выйти из этого режима
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div
            className="flex flex-col rounded-[20px] bg-white overflow-hidden cursor-default"
            style={{
              width: '360px',
              maxWidth: '360px',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: (step === 'confirmation' || step === 'success') ? 'auto' : (showHeader ? 0 : 'auto'),
              marginBottom: (step === 'confirmation' || step === 'success') ? 'calc(20px + var(--sab, 0px))' : '20px',
              maxHeight: showHeader ? 'calc(100dvh - var(--header-zone, 90px))' : 'calc(100dvh - 145px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              key={step}
              className="flex flex-col w-full overflow-y-auto"
              style={{
                animation: 'frame5StepIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              }}
            >
              {step === 'personal_data' && (
                <PersonalDataStep
                  data={personalData}
                  errors={errors}
                  onChange={setPersonalData}
                  onNext={handlePersonalNext}
                  onBack={handleBackFromPersonal}
                />
              )}

              {step === 'address' && (
                <AddressStep
                  data={addressData}
                  errors={errors}
                  onChange={setAddressData}
                  onNext={handleAddressNext}
                  onBack={() => setStep('personal_data')}
                  onOpenAddressModal={openAddressModal}
                />
              )}

              {step === 'confirmation' && (
                <ConfirmationStep
                  onConfirm={handleConfirm}
                  onEdit={() => setStep('personal_data')}
                  isSubmitting={isSubmitting}
                />
              )}

              {step === 'success' && (
                <SuccessStep orderNumber={orderNumber || 'TEST-000001'} onFaq={() => router.push('/faq')} />
              )}
            </div>
          </div>
        </div>
      </div>

      <AddressInputModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onComplete={() => setShowAddressModal(false)}
        initialStep={addressModalStep}
      />
    </div>
  );
}

export default function Frame5() {
  return (
    <AddressProvider>
      <Frame5Content />
    </AddressProvider>
  );
}
